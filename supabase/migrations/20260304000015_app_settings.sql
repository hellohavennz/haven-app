-- app_settings: generic key-value config table
-- Used for admin-controlled runtime settings (e.g. site-wide sale)

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

-- Default sale state: off
INSERT INTO app_settings (key, value)
VALUES ('sale', '{"active": false, "discount": 0}')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read settings (needed for sale banner on pricing page)
CREATE POLICY "public_read_app_settings"
  ON app_settings FOR SELECT
  USING (true);

-- Only the admin account can write
CREATE POLICY "admin_write_app_settings"
  ON app_settings FOR ALL
  TO authenticated
  USING     ((auth.jwt() ->> 'email') = 'hello.haven.nz@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'hello.haven.nz@gmail.com');
