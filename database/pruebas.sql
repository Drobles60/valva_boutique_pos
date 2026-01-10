-- ============================================
-- ARCHIVO DE PRUEBAS - Usuario Admin
-- ============================================
USE valva_boutique_pos;

-- Insertar usuario administrador de prueba
-- Username: admin
-- Password: 1234
-- Email: admin@valvaboutique.com
INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol, estado) 
VALUES (
    'admin', 
    'admin@valvaboutique.com', 
    '$2b$10$rV8PqJJE6P5h5yGKxJxQYuX8TJKl3kGn.5oC8qI7Y6pYFcGXHN1Ge',  -- Hash de "1234"
    'Administrador', 
    'Sistema', 
    '0999999999', 
    'administrador', 
    'activo'
);

-- Verificar que se creó correctamente
SELECT id, username, email, rol, estado FROM usuarios WHERE username = 'admin';

-- ============================================
-- NOTA: El password_hash es el resultado de bcrypt.hash('1234', 10)
-- Si necesitas cambiar la contraseña, usa este código:
--
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('1234', 10);
-- console.log(hash);
-- ============================================
