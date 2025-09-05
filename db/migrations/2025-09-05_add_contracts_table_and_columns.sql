-- Create contracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  proposal_id INT UNIQUE,
  -- The next two columns may be missing in your DB; we add them below with IF NOT EXISTS
  -- sales_order_id INT UNIQUE,
  -- activity_id INT UNIQUE,
  status ENUM('RASCUNHO','ATIVO','ENCERRADO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  signed_at DATE NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  notes TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns if they do not exist (MySQL 8+ supports IF NOT EXISTS)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS sales_order_id INT UNIQUE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS activity_id INT UNIQUE;

-- Foreign keys
ALTER TABLE contracts
  ADD CONSTRAINT IF NOT EXISTS fk_contracts_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE contracts
  ADD CONSTRAINT IF NOT EXISTS fk_contracts_proposal
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL;

ALTER TABLE contracts
  ADD CONSTRAINT IF NOT EXISTS fk_contracts_sales_order
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL;

ALTER TABLE contracts
  ADD CONSTRAINT IF NOT EXISTS fk_contracts_activity
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL;