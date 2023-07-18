import { connect } from 'mongoose';
import { DB_URL } from '../config/config.js';

export const db = connect(DB_URL);
