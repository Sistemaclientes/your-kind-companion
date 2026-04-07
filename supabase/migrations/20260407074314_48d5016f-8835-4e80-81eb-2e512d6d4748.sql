-- Manually add the first administrator
INSERT INTO public.admins (id, email, role)
SELECT id, email, 'master'
FROM auth.users
WHERE email = 'suprememidias.ok@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'master';

-- Mark the bootstrap invitation as used
UPDATE public.convites_admin 
SET usado = true 
WHERE token = 'primeiro-admin-bootstrap';