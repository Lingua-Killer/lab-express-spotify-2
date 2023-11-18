require('dotenv').config();
// Requerimos los paquetes express y hbs
const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');
// Creamos una instancia de express
const app = express();
// Configuramos el motor de vistas como hbs
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.set('view options', { layout: 'layouts/main' });
// Configuramos el middleware para servir archivos estáticos
app.use(express.static(__dirname + '/public'));

// Creamos una instancia de SpotifyWebApi con nuestras credenciales de Spotify
// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

// Recupera un token de acceso para la API de Spotify
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Configura la ruta de búsqueda de inicio
app.get('/', (req, res) => {
    console.log("llamada recibida inicio")
    res.render('inicio');
});
// Configura la ruta para la búsqueda de artistas
app.get('/artist-search', (req, res) => {

    const artistName = req.query.artist;// obtiene el término de búsqueda desde el objeto req
    console.log("artista -> " + artistName);
    spotifyApi.searchArtists(artistName)// función para buscar artistas en la API de Spotify
        .then(data => {
            console.log('The received data from the API: ', data.body);
            let result = data.body;
            result.artists.items.forEach(element => {
                console.log("Result -> " + element.name);
            });
            let artistas = result.artists.items;

            res.render('artist-search-results', { artistas });

        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
});
// Configura la ruta para mostrar los álbumes de un artista
app.get('/albums/:artistId', (req, res) => {
    const { artistId } = req.params;

    spotifyApi.getArtistAlbums(`${artistId}`)// función para recuperar los álbumes de un artista desde la API de Spotify
        .then(response => {
            const albumsList = response.body.items// obtiene la lista de álbumes desde la respuesta de la API


            res.render('albums', { albumsList });
        })
        .catch(err => console.log(err));
});

// ruta para las canciones
app.get('/tracks/:trackId', (req, res) => {
    const { trackId } = req.params;
    console.log("Track id -> " + trackId);
    spotifyApi.getAlbumTracks(`${trackId}`)
        .then(response => {
            const tracks = response.body.items;
            console.log("cancion-->" + tracks);
            res.render('tracks', { tracks });
        })
        .catch(err => console.log(err));
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));


