import path from 'path';
import { parse } from 'yaml'
import { promises as fs } from 'fs';

export const getDatabases = async () => {

    const jsonDirectory = path.join(process.cwd(), 'data');
    //Read the json data file data.json
    const fileContents = await fs.readFile(jsonDirectory + '/databases.yaml', 'utf8');
    //Return the content of the data file in json format
    const data = parse(fileContents);

    return data

}

export const getFeaturedDatabases = async () => {

    return getDatabases().then((dbs) => {
        return dbs.filter((db: any) => db.featured)
    });

}

export const getDatabasesCount = async () => {
    
        return getDatabases().then((dbs) => {
            return dbs.length
        });
};