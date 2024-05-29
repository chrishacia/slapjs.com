import { RowDataPacket } from 'mysql2/promise';

import Database from '../database';
import { GeoLocation, PostalCode } from '../../types/geolocations.types';

export default class GeoLocationModel {
  #db: Database;
  #geoTable = 'geolocation';

  constructor() {
    this.#db = new Database();
  }

  async closeConnection(): Promise<void> {
    await this.#db.close();
  }

  async getLatAndLongByPostCode(postCode: string): Promise<GeoLocation[]> {
    const query = `SELECT latitude, longitude FROM ${this.#geoTable} WHERE postcode = ?`;
    const params: [string] = [postCode];
    const result = await this.#db.query<RowDataPacket[]>(query, params);
    return result as GeoLocation[];
  }

  async getPostalCodesWithinRadius(lat: string, long: string, radius: string): Promise<PostalCode[]> {
    const query = `SELECT postcode FROM ${this.#geoTable} WHERE (3959 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) < ?`;
    const params: [string, string, string, string] = [lat, long, lat, radius];
    const result = await this.#db.query<RowDataPacket[]>(query, params);
    return result as PostalCode[];
  }

  async getPostalCodesWithinRadiusOfPostCode(postCode: string, radius: string): Promise<PostalCode[]> {
    const query = `
      SELECT postcode
      FROM ${this.#geoTable}
      WHERE (3959 * acos(cos(radians(latitude)) * cos(radians((SELECT latitude FROM ${this.#geoTable} WHERE postcode = ?))) * cos(radians(longitude) - radians((SELECT longitude FROM ${this.#geoTable} WHERE postcode = ?))) + sin(radians(latitude)) * sin(radians((SELECT latitude FROM ${this.#geoTable} WHERE postcode = ?))))) < ?
    `;
    const params: [string, string, string, string] = [postCode, postCode, postCode, radius];
    const result = await this.#db.query<RowDataPacket[]>(query, params);
    return result as PostalCode[];
  }
}
