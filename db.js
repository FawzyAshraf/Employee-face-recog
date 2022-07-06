import mysql from 'mysql';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employees_face_recog'
});
connection.connect();

export const init_db = async () => {

    connection.query('CREATE TABLE IF NOT EXISTS Employee(Name varchar(32), Phone int, Image varchar(255))', function (error, results, fields) {
        if (error) throw error;
        console.log('Initialized The Database');
    });

}

export const addEmployee = (name, phone, restorePath) => {
    connection.query(`INSERT INTO Employee (Name, Phone, Image) VALUES ('${name}', '${phone}', '${restorePath}')`), (error, results, fields) => {
        if (error) throw error;
        console.log('added an employee');
    }
}

export const DoesEmployeeExist = async (name, phone) => {
    const data = await getQueryData(`SELECT * FROM Employee WHERE Name="${name}" AND Phone="${phone}"`);
    return data.length !== 0;
}

export const getEmployee = async (name) => {
    const data = await getQueryData(`SELECT * FROM Employee WHERE Name="${name}"`);
    return data;
}

export const getAllImagesWithLabels = async () => {
    const data = await getQueryData(`SELECT Name, Image FROM Employee`);
    return data;
}

async function getQueryData(sqlQuery) {
    return new Promise(data => {
        connection.query(sqlQuery, function (error, result) {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                data(result);
            } catch (error) {
                data({});
                throw error;
            }
        });
    });
}

