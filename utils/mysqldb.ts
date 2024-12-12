import path from "path";
import { Sequelize } from "sequelize-typescript";
require("dotenv").config();

const sequelize = new Sequelize(`mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`, {
    
});

sequelize.addModels([path.resolve(__dirname, '../models/sql')])

const connectMysql = async() => {
    try {
        await sequelize.authenticate();
        console.log("Mysql has been connected.");
    } catch (error: any) {
        console.log(error.message);
        setTimeout(connectMysql, 5000);
    }
}


export default connectMysql;