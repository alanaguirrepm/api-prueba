const express = require('express');
const bodyParser = require('body-parser');
const { sql, poolPromise } = require('./dbconfig'); //usa poolpromise para las credenciales de conexion 
const cors = require('cors'); //impide que la seguridad no le de acceso al puerto 4200 de angular

const app = express(); //invoca a express 
const port = 3000; // establece el puerto de conexion 

app.use(cors()); // cualquier puerto puede conectarse a la base de datos 


app.use(bodyParser.json()); //da la respuesta en un JSON
app.use(bodyParser.urlencoded({ extended: true }));


// Lista de personas agregadas con un metodo get

app.get('/personas', async (req, res) => { //personas será la ruta de la url
    try {
        // Obtener una conexión a la base de datos
        const pool = await poolPromise;

        // Implementamos la consulta en sql
        const query = `
            SELECT id, nombre, apellido, edad, email
            FROM PRUEBA_PERSONAS
        `;

        // Ejecutar la consulta
        const result = await pool.request().query(query);

        // Enviar el resultado como respuesta en formato JSON
        res.json(result.recordset);
    } catch (err) {
        // Si hay algún error, enviar un código 500 y el mensaje de error
        res.status(500).send(err.message);
    }
});

////////////////////////////////////////////////////////////////////////////////
app.post('/agregar', async (req, res) => {
    try {
        // Extrae los valores del body en la solicitud hecha
        const { nombre, apellido, edad, email } = req.body;

        // valida que todos los campos estén presentes 
        if (!nombre || !apellido || !edad || !email) {
            // Si falta algún campo, se envía un mensaje de error con código 400 (Bad Request)
            return res.status(400).send('Todos los campos son requeridos');
        }

        // Crea una instancia del pool de conexión a la base de datos
        const pool = await poolPromise;

        // Aquí se crea la consulta en mysql
        const query = `
            INSERT INTO PRUEBA_PERSONAS (nombre, apellido, edad, email)
            VALUES (@nombre, @apellido, @edad, @correo)
        `;

        // Ejecuta la consulta SQL, utilizando parámetros para prevenir inyecciones a SQL
        await pool.request()
            .input('nombre', nombre)      
            .input('apellido', apellido)  
            .input('edad', edad)          
            .input('correo', email)       
            .query(query);                // Ejecuta la consulta SQL

        // Si la consulta fue exitosa, se envía una respuesta con el código 201 (Created)
        res.status(201).send('Persona creada exitosamente');
    } catch (err) {
        // Si ocurre algún error en el proceso, se captura el error y se envía una respuesta con código 500 (Internal Server Error)
        res.status(500).send(err.message);
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/anadir', async (req, res) => {
    try {
        // Extrae los valores de los query parameters en la URL (req.query)
        const {id, nombre, apellido, edad, correo } = req.query;

        // Verifica que todos los campos necesarios están presentes
        if (!id || !nombre || !apellido || !edad || !correo) {
            return res.status(400).send('Todos los campos son requeridos');
        }

        const pool = await poolPromise;
        const query = `
            INSERT INTO PRUEBA_PERSONAS (id, nombre, apellido, edad, email)
            VALUES (@id, @nombre, @apellido, @edad, @correo)
        `;

        // Ejecutar la consulta
        await pool.request()
            .input('id', id)
            .input('nombre', nombre)
            .input('apellido', apellido)
            .input('edad', edad)
            .input('correo', correo)
            .query(query);

        res.status(201).send('Persona creada exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.put('/anadir/:id', async (req, res) => { //URL DEL ENDPOINT
    try {
        // Extraer los parámetros de la URL
        const { id } = req.params;  // Extraer el ID de los parámetros de ruta
        const { nombre, apellido, edad, correo } = req.query;  // Extraer los parámetros de la query (después del ? en la URL)

        // Validar que los campos están presentes
        if (!nombre || !apellido || !edad || !correo) {
            return res.status(400).send('Todos los campos son requeridos');
        }

        const pool = await poolPromise;

        // Consulta SQL para actualizar la persona existente
        const query = `
            UPDATE PRUEBA_PERSONAS
            SET nombre = @nombre, apellido = @apellido, edad = @edad, email = @correo
            WHERE id = @id
        `;

        // Ejecutar la consulta SQL con los parámetros
        await pool.request()
            .input('id', id)         // ID que viene desde los parámetros de ruta
            .input('nombre', nombre)
            .input('apellido', apellido)
            .input('edad', edad)
            .input('correo', correo)
            .query(query);

        // Enviar respuesta de éxito
        res.status(200).send('Persona actualizada exitosamente');
    } catch (err) {
        // Manejar errores
        res.status(500).send(err.message);
    }
});
/////////////////////////////////////////////////////////////////////////////////////////
app.delete('/borrar/:id', async (req, res) => {
    try {
        // Extraer el ID de los parámetros de ruta
        const { id } = req.params;

        const pool = await poolPromise;

        // Consulta SQL para eliminar la persona
        const query = `
            DELETE FROM PRUEBA_PERSONAS
            WHERE id = @id
        `;

        // Ejecutar la consulta SQL con el parámetro
        await pool.request()
            .input('id', id)  // ID que viene desde los parámetros de ruta
            .query(query);

        // Enviar respuesta de éxito
        res.status(200).send('Persona eliminada exitosamente');
    } catch (err) {
        // Manejar errores
        res.status(500).send(err.message);
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`); //el app esta corriendo en el puerto 3000
});