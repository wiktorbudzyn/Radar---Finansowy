const mongoose = require('mongoose');

module.exports = () => {
    try {
        mongoose.connect(process.env.DB);
        console.log('Udało się połączyć z bazą danych');
    } catch (error) {
        console.error(error);
        console.log('Nie udało się połączyć z bazą danych!');
    }
};
