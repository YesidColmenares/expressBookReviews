// Importa Express, framework para crear servidores y manejar rutas HTTP
const express = require('express');

// Importa la "base de datos" de libros (objeto con ID/ISBN como clave y detalles como valor)
let books = require("./booksdb.js");

// Importa la función que valida si un nombre de usuario ya existe en el sistema
let isValid = require("./auth_users.js").isValid;

// Importa el arreglo de usuarios registrados desde auth_users.js
let users = require("./auth_users.js").users;

// Crea un Router de Express para definir rutas públicas de usuarios
const public_users = express.Router();

// Importa Axios, cliente HTTP para hacer solicitudes a endpoints (internos o externos)
const axios = require('axios');


// Función asincrónica que devuelve todos los libros como una Promesa
// Simula una operación de base de datos que podría tardar un poco
const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        // Si existen libros en la "base de datos" (books)
        if (books) {
            // Resuelve la promesa con el objeto de libros
            resolve(books);
        } else {
            // Si no hay libros disponibles, rechaza la promesa con un mensaje de error
            reject("No books available");
        }
    });
};

// Endpoint para registrar un nuevo usuario
// Ruta: POST /register
// Descripción: Recibe un nombre de usuario y contraseña en el cuerpo de la solicitud
//              Valida los datos y registra al usuario si es válido
public_users.post("/register", (req, res) => {

    // Obtiene username y password del cuerpo de la solicitud
    const username = req.body.username;
    const password = req.body.password;

    // Valida que ambos campos existan
    if (!username || !password) {
        // Si falta alguno, devuelve un error 400 (Bad Request)
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Verifica si el usuario ya existe usando la función isValid
    if (isValid(username)) {
        // Si el usuario ya está registrado, devuelve un error 409 (Conflict)
        return res.status(409).json({ message: "User already exists" });
    }

    // Si todo es válido, agrega el usuario al arreglo de usuarios registrados
    users.push({ username: username, password: password });

    // Devuelve un mensaje de éxito
    return res.status(200).json({ message: "User successfully registered. Now you can login" });

});


// Endpoint para obtener la lista de todos los libros disponibles
// Ruta: GET /
// Descripción: Devuelve todos los libros de la "base de datos" de manera asincrónica
//              usando la función getBooksAsync (Promesa simulada)
public_users.get('/', async (req, res) => {
    try {
        // Llama a la función asincrónica para obtener todos los libros
        const allBooks = await getBooksAsync();

        // Devuelve los libros en formato JSON con indentación de 4 espacios
        return res.status(200).json(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        // Si ocurre un error (por ejemplo, no hay libros), devuelve un error 500
        return res.status(500).json({ message: err });
    }
});

// Endpoint para obtener la lista de libros usando Axios + Async-Await
// Ruta: GET /task10
// Descripción: Este endpoint hace una llamada HTTP a la propia API (/)
//              usando Axios para demostrar cómo trabajar con Promesas/Async-Await
public_users.get('/task10', async (req, res) => {
    try {
        // Llamada HTTP a tu propio endpoint raíz '/' usando Axios
        const response = await axios.get('http://localhost:5000/');
        
        // Extrae los datos de los libros de la respuesta
        const booksList = response.data;

        // Devuelve un JSON con un mensaje de éxito y la lista de libros
        return res.status(200).json({
            message: "Books fetched successfully using Axios + Async-Await",
            books: booksList
        });

    } catch (err) {
        // Maneja errores (por ejemplo, servidor no disponible)
        // Devuelve un error 500 con el mensaje del error
        return res.status(500).json({ 
            message: "Error fetching books", 
            error: err.message 
        });
    }
});

// Endpoint para obtener los detalles de un libro por ISBN
// Ruta: GET /isbn/:isbn
// Descripción: Devuelve la información de un libro específico según el ISBN proporcionado
//              usando la función asincrónica getBooksAsync
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        // Obtiene todos los libros de manera asincrónica
        const allBooks = await getBooksAsync();

        // Obtiene el ISBN de los parámetros de la solicitud
        const isbn = req.params.isbn;

        // Busca el libro correspondiente al ISBN
        const book = allBooks[isbn];

        // Si el libro existe, devuelve su información en JSON formateado
        if (book) {
            return res.status(200).json(JSON.stringify(book, null, 4));
        } else {
            // Si no existe, devuelve un error 404
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        // Maneja errores de la promesa y devuelve un error 500
        return res.status(500).json({ message: err });
    }
});

// Tarea 11: Obtener detalles de un libro por ISBN usando Axios + Async-Await
public_users.get('/task11/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        // Llamada HTTP a tu propio endpoint /isbn/:isbn
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        
        // response.data contiene los datos del libro
        return res.status(200).json({
            message: `Book details fetched successfully for ISBN ${isbn}`,
            book: response.data
        });
    } catch (err) {
        // Si Axios falla (ej. ISBN no existe o servidor apagado)
        return res.status(500).json({
            message: `Error fetching book with ISBN ${req.params.isbn}`,
            error: err.message
        });
    }
});

// Endpoint para obtener los detalles de libros por autor
// Ruta: GET /author/:author
// Descripción: Devuelve todos los libros cuyo autor coincida con el nombre proporcionado
//              usando la función asincrónica getBooksAsync
public_users.get('/author/:author', async (req, res) => {
    try {
        // Obtiene todos los libros de manera asincrónica
        const allBooks = await getBooksAsync();

        // Obtiene el nombre del autor de los parámetros de la solicitud
        const author = req.params.author;

        // Objeto para almacenar los libros filtrados por autor
        let filteredBooks = {};

        // Itera sobre todas las claves del objeto books
        Object.keys(allBooks).forEach(key => {
            if (allBooks[key].author === author) {
                filteredBooks[key] = allBooks[key];
            }
        });

        // Si se encontraron libros, los devuelve en JSON formateado
        if (Object.keys(filteredBooks).length > 0) {
            return res.status(200).json(JSON.stringify(filteredBooks, null, 4));
        } else {
            // Si no se encontraron libros, devuelve un error 404
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch(err) {
        // Maneja errores de la promesa y devuelve un error 500
        return res.status(500).json({ message: err });
    }
});

// Tarea 12: Obtener libros por autor usando Axios + Async-Await
public_users.get('/task12/:author', async (req, res) => {
    try {
        const author = req.params.author;

        // Llamada HTTP a tu propio endpoint /author/:author
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        
        // response.data contiene los datos filtrados
        return res.status(200).json({
            message: `Books fetched successfully for author ${author}`,
            books: response.data
        });
    } catch (err) {
        return res.status(500).json({
            message: `Error fetching books for author ${req.params.author}`,
            error: err.message
        });
    }
});

// Endpoint para obtener los detalles de libros por título
// Ruta: GET /title/:title
// Descripción: Devuelve todos los libros cuyo título coincida con el proporcionado
//              usando la función asincrónica getBooksAsync
public_users.get('/title/:title', async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        const title = req.params.title;
        let filteredBooks = [];

        Object.keys(allBooks).forEach(key => {
            if (allBooks[key].title === title) {
                filteredBooks.push(allBooks[key]); // agregamos solo el libro al array
            }
        });

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks); // ya es un array
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch(err) {
        return res.status(500).json({ message: err });
    }
});

// Tarea 13: Obtener libros por título usando Axios + Async-Await
public_users.get('/task13/:title', async (req, res) => {
    try {
        const title = req.params.title;

        // Llamada HTTP a tu propio endpoint /title/:title
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        
        // response.data contiene los datos filtrados
        return res.status(200).json({
            message: `Books fetched successfully for title "${title}"`,
            books: response.data
        });
    } catch (err) {
        return res.status(500).json({
            message: `Error fetching books with title "${req.params.title}"`,
            error: err.message
        });
    }
});

// Endpoint para obtener las reseñas de un libro por ISBN
// Ruta: GET /review/:isbn
// Descripción: Devuelve todas las reseñas de un libro específico según el ISBN proporcionado
public_users.get('/review/:isbn', function (req, res) {

    // Obtiene el ISBN de los parámetros de la solicitud
    const isbn = req.params.isbn;

    // Busca el libro correspondiente al ISBN
    const book = books[isbn];

    // Si el libro existe, devuelve sus reseñas en JSON formateado
    if (book) {
        return res.status(200).json(JSON.stringify(book.reviews, null, 4));
    } else {
        // Si no existe el libro, devuelve un error 404
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
