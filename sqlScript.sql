CREATE TABLE logs(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
	date TIMESTAMP DEFAULT NOW(),
	health_score INT,
	notes TEXT,
	photo_url TEXT,
	created_at TIMESTAMP DEFAULT NOW()
)

SELECT * FROM logs