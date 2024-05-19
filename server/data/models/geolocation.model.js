const Database = require('../database');
// const { logger } = require('../../logger');
// const { getUtcDateTime } = require('../../../shared/utils/date.functions');

module.exports = class geoLocationModel {
    #db;
    #geoTable = 'geolocation';

    constructor() {
        this.#db = new Database();
    }

    async closeConnection() {
        await this.#db.close();
    }

    async getLatAndLongByPostCode(postCode) {
        const query = `SELECT latitude, longitude FROM ${this.#geoTable} WHERE postcode = ?`;
        const params = [postCode];
        const result = await this.#db.query(query, params);
        return result;
    }

    async getPostalCodesWithinRadius(lat, long, radius) {
        const query = `SELECT postcode FROM ${this.#geoTable} WHERE (3959 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))) < ?`;
        const params = [lat, long, lat, radius];
        const result = await this.#db.query(query, params);
        return result;
    }

    async getPostalCodesWithinRadiusOfPostCode(postCode, radius) {
        // const query = `SELECT postcode FROM ${this.#geoTable} WHERE (3959 * acos(cos(radians(latitude)) * cos(radians((SELECT latitude FROM ${this.#geoTable} WHERE postcode = ?))) * cos(radians(longitude) - radians((SELECT longitude FROM ${this.#geoTable} WHERE postcode = ?))) + sin(radians(latitude)) * sin(radians((SELECT latitude FROM ${this.#geoTable} WHERE postcode = ?)))) < ?`;
        const query = `
            SELECT postal_code
            FROM geolocation
            WHERE (3959 * acos(cos(radians(latitude)) * cos(radians((SELECT latitude FROM geolocation WHERE postal_code = ?))) * cos(radians(longitude) - radians((SELECT longitude FROM geolocation WHERE postal_code = ?))) + sin(radians(latitude)) * sin(radians((SELECT latitude FROM geolocation WHERE postal_code = ?))))) < ?
        `;
        const params = [postCode, postCode, postCode, radius];
        const result = await this.#db.query(query, params);

        return result;
    }

}