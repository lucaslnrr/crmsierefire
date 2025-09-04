CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  role ENUM('comercial','diretoria') NOT NULL DEFAULT 'comercial',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cnpj VARCHAR(20) NULL,
  cpf VARCHAR(15) NULL,
  caepf VARCHAR(30) NULL,
  endereco VARCHAR(255) NULL,
  contato VARCHAR(100) NULL,
  telefone VARCHAR(40) NULL,
  email VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (cnpj), INDEX (cpf), INDEX (caepf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category ENUM('Exames','Treinamentos','Laudos','Programas','PGR','PCMSO','LTCAT','Palestra') NOT NULL,
  default_duration_minutes INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  created_by INT NULL,
  description TEXT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('RASCUNHO','ENVIADA','APROVADA','REJEITADA','CANCELADA') NOT NULL DEFAULT 'RASCUNHO',
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proposal_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id INT NOT NULL,
  service_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  proposal_id INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  monthly_value DECIMAL(12,2) NULL,
  status ENUM('ATIVO','ENCERRADO') NOT NULL DEFAULT 'ATIVO',
  notes TEXT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contract_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity_proposta INT NOT NULL DEFAULT 1,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company_id INT NULL,
  service_id INT NULL,
  assigned_user_id INT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NULL,
  status ENUM('PENDENTE','EM_ATRASO','CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
  created_from ENUM('PROPOSTA','CONTRATO','MANUAL') NOT NULL DEFAULT 'MANUAL',
  related_id INT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (start_datetime), INDEX (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  event_type ENUM('EXECUTED','RESCHEDULED','CANCELED','NO_SHOW','NOTE') NOT NULL,
  event_time DATETIME NOT NULL,
  new_datetime DATETIME NULL,
  performed_by INT NULL,
  notes TEXT NULL,
  evidence_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_activity_event (activity_id, event_type, event_time),
  INDEX (activity_id), INDEX (event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
