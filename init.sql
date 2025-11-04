CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_cliente VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDENTE',
    urgencia_calculada VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Set database encoding to UTF-8
SET client_encoding = 'UTF8';
