const https = require('https');
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
    const dummyApiUrl = "https://jsonplaceholder.typicode.com/posts/1";

    try {
        const apiResponse = await new Promise((resolve, reject) => {
            https.get(dummyApiUrl, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            }).on('error', (err) => {
                reject(err);
            });
        });

        const params = {
            TableName: "MyTable",
            Item: {
                id: { S: apiResponse.id.toString() },
                title: { S: apiResponse.title },
                body: { S: apiResponse.body }
            }
        };

        await dynamoDbClient.send(new PutItemCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
