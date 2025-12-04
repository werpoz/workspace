# Database Schema Design

## Tables Overview

### Auctions Table

```sql
CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  starting_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP NOT NULL
);
```

### Bids Table

```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  auction_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  bidder_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_auction FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  CONSTRAINT fk_bidder FOREIGN KEY (bidder_id) REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_auction_bids (auction_id, created_at DESC),
  INDEX idx_bidder_history (bidder_id, created_at DESC)
);
```

### Query Examples

**Get all bids for an auction:**
```sql
SELECT * FROM bids 
WHERE auction_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC;
```

**Get current highest bid:**
```sql
SELECT * FROM bids 
WHERE auction_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY amount DESC 
LIMIT 1;
```

**Get auction with bid count:**
```sql
SELECT 
  a.*, 
  COUNT(b.id) as bid_count,
  MAX(b.amount) as current_price
FROM auctions a
LEFT JOIN bids b ON a.id = b.auction_id
WHERE a.id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY a.id;
```

## Relationship Summary

- **Auction 1:N Bids** - One auction has many bids
- **Account 1:N Bids** - One account (bidder) can place many bids
- The `auction_id` in `Bid` entity ensures we can query all bids for a specific auction
