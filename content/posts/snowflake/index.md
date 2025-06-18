+++
title = "Behind Twitter's Snowflake: How to Generate Millions of Unique IDs Per Second"
date = "2025-06-04"
+++

Imagine you're tasked with designing a system to generate unique IDs. The requirements seem simple at first, but as you dig deeper, you realize there's more to consider. Let's walk through the key questions you might ask:

**What are the characteristics of unique IDs?**
- They must be unique across your entire system
- They should be sortable, especially by time
- They need to be generated quickly and efficiently

**What are the technical constraints?**
- IDs must fit into 64 bits (no more, no less)
- They should be numerical values only
- The system needs to handle high throughput (thousands of IDs per second)
- IDs created later should be larger than those created earlier

**What are the challenges?**
- How do you ensure uniqueness across distributed systems?
- How do you maintain time-ordering without centralized coordination?
- How do you handle high throughput without creating bottlenecks?

This is exactly the problem Twitter faced when designing their Snowflake ID system. Their solution? A brilliant approach that generates unique, time-ordered 64-bit IDs that can handle millions of events per second across global data centers, all without centralized coordination.

At its core, Snowflake is Twitter's clever solution to the ID generation problem. Think of it as a smart way to create unique numbers that not only tell you when something was created but also where it came from. It's like having a timestamp and a location tag all rolled into one 64-bit number. The best part? It works across multiple servers without them having to talk to each other, making it perfect for systems that need to handle massive amounts of data.
<!--more-->

## Anatomy of a Snowflake ID

![Snowflake Id](snowflakeid.png "snowflake id example")

A Snowflake ID is a 64-bit integer composed of four components, designed for uniqueness, scalability, and time-ordering:

*   **Sign Bit (1 bit):** Reserved, set to 0 for positive integers.
*   **Timestamp (41 bits):** Milliseconds since a custom epoch (e.g., Twitter's epoch: November 4, 2010, 01:42:54.657 UTC, or 1288834974657 ms). Supports ~69.7 years (2⁴¹ ms ≈ 69.7 years).
*   **Worker/Shard ID (10 bits):** Identifies the generating database shard or node, supporting 1,024 unique shards (2¹⁰).
*   **Sequence Number (12 bits):** A per-millisecond counter, allowing 4,096 IDs per millisecond per shard (2¹²).

The bit layout is:

| Sign Bit (1 bit) | Timestamp (41 bits)                         | Worker/Shard ID (10 bits) | Sequence Number (12 bits)       |
|:----------------:|:--------------------------------------------|:--------------------------|:--------------------------------|
| 0                | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | `yyyyyyyyyy`              | `zzzzzzzzzzzz`                  |

The ID is computed as:

```
ID = ((timestamp - epoch) << 22) | (shard_id << 12) | sequence
```

Key properties:

*   **Uniqueness:** Timestamp, shard ID, and sequence ensure no collisions, assuming synchronized clocks and unique shard IDs.
*   **Time-Ordering:** The timestamp in the most significant bits ensures IDs are sortable chronologically.
*   **Throughput:** Each shard can generate 4,096 IDs/ms, or ~4.1 million IDs/second. With 1,024 shards, the system supports ~4.2 billion IDs/second.

## Why Snowflake? Motivation and Trade-offs

Traditional ID generation in databases struggles in distributed environments:

*   Auto-incrementing IDs: Centralized sequences (e.g., PostgreSQL's SERIAL) create bottlenecks and require coordination across shards.
*   UUIDs (128 bits): Globally unique but not time-ordered, large, and inefficient for B-tree indexes in databases like PostgreSQL.
*   Random IDs: Lack ordering and may require collision checks, reducing performance.

Snowflake's advantages in a database context:

*   Decentralized Generation: Each database shard generates IDs independently using its shard ID, avoiding cross-node coordination.
*   High Throughput: 4,096 IDs/ms per shard scales linearly with the number of shards.
*   Compactness: 64-bit IDs are efficient for storage and indexing compared to 128-bit UUIDs.
*   Time-Ordering: Enables efficient range queries and index scans, critical for applications like Twitter's tweet timeline.

Trade-offs:

*   Clock Synchronization: Database nodes must have synchronized clocks (via NTP) to avoid timestamp collisions.
*   Epoch Limitation: The 41-bit timestamp limits the system to ~69 years from the epoch.
*   Shard ID Management: Unique shard IDs must be assigned, often requiring configuration or a coordination service.
*   Sequence Exhaustion: Generating >4,096 IDs/ms per shard forces a wait, introducing latency.

## Mathematical Foundations

Snowflake's design leverages bit manipulation and time-based partitioning. Let's analyze its capacity:

*   Timestamp (41 bits): Maximum value is 2⁴¹ - 1 ≈ 2.2 trillion ms ≈ 69.7 years. With an epoch of 1288834974657 (2010), IDs are valid until ~2080.
*   Shard ID (10 bits): Supports 2¹⁰ = 1,024 shards, sufficient for most database clusters.
*   Sequence Number (12 bits): Supports 2¹² = 4,096 IDs/ms per shard, or 4.1 million IDs/second/shard.
*   Total Throughput: With 1,024 shards, the system supports 1,024 × 4,096 = 4,194,304 IDs/ms, or ~4.2 billion IDs/second.

Time-ordering is deterministic: for IDs ID1 = (t1 << 22) | (s1 << 12) | seq1 and ID2 = (t2 << 22) | (s2 << 12) | seq2, if t1 < t2, then ID1 < ID2, regardless of shard or sequence.

## Snowflake Mechanics in SQL

In a database like PostgreSQL, Snowflake IDs are generated using a combination of a sequence (for the sequence number) and server-side functions (for timestamp and shard ID). The function uses bit manipulation to assemble the ID, leveraging PostgreSQL's plpgsql for performance.

### Timestamp Generation

The timestamp is computed as:

`timestamp = FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) - epoch`

`clock_timestamp()` provides the current time with millisecond precision, and the epoch is subtracted to align with the Snowflake structure.

### Shard ID

The shard ID (10 bits) identifies the database instance or shard. It can be:

*   Hardcoded in the function (e.g., `shard_id = 1`).
*   Configured via a database parameter or table.
*   Derived dynamically (e.g., from a node identifier stored in a configuration table).

### Sequence Number

A PostgreSQL `SEQUENCE` object generates the sequence number, modulo 2¹² (4,096), to fit the 12-bit field. The sequence is typically database-local, ensuring no coordination is needed across shards.

### ID Assembly

The ID is assembled using bitwise operations:

`ID = (timestamp << 22) | (shard_id << 12) | sequence`

PostgreSQL's bitwise operators (`<<` for left-shift, `|` for OR) are used to combine components.

## SQL Implementation

Below is a refined PostgreSQL implementation of the Snowflake ID generator, optimized for production use with error handling, configuration flexibility, and performance considerations:

```sql
 -- Create a sequence for the 12-bit sequence number (0 to 4095)
 CREATE SEQUENCE public.global_id_seq MINVALUE 0 MAXVALUE 4095 CYCLE;
 ALTER SEQUENCE public.global_id_seq OWNER TO postgres;

-- Create the Snowflake ID generator function
 CREATE OR REPLACE FUNCTION public.id_generator(shard_id_param int DEFAULT 1)
 RETURNS bigint
 LANGUAGE 'plpgsql' VOLATILE
 AS $BODY$
 DECLARE
 our_epoch bigint := 1288834974657; -- Twitter's epoch: Nov 4, 2010
 seq_id bigint;
 now_millis bigint;
 shard_id int;
 result bigint;
 BEGIN
 -- Validate shard_id (0 to 1023)
 IF shard_id_param < 0 OR shard_id_param >= 1024 THEN
 RAISE EXCEPTION 'Shard ID must be between 0 and 1023, got %', shard_id_param;
 END IF;
 shard_id := shard_id_param & (1 << 10 - 1); -- Mask to 10 bits

-- Get sequence number (0 to 4095)
SELECT nextval('public.global_id_seq') INTO seq_id;

-- Get current timestamp in milliseconds
SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;

-- Check for clock skew
IF now_millis < our_epoch THEN
    RAISE EXCEPTION 'Clock moved before epoch! Current: %, Epoch: %', now_millis, our_epoch;
END IF;

-- Assemble ID: (timestamp << 22) | (shard_id << 12) | sequence
result := (now_millis - our_epoch) << 22;
result := result | (shard_id << 12);
result := result | (seq_id & (1 << 12 - 1)); -- Mask to 12 bits

RETURN result;

END; $BODY$;

ALTER FUNCTION public.id_generator(int) OWNER TO postgres;

-- Example usage: Generate an ID with shard_id = 1
-- SELECT public.id_generator(1);