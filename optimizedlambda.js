const axios = require('axios');
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

let dynamoDbClient;

exports.handler = async (event) => {
    const dummyApiUrl = process.env.DUMMY_API_URL;
    const tableName = process.env.TABLE_NAME;
    const region = process.env.AWS_REGION;

    if (!dynamoDbClient) {
        dynamoDbClient = new DynamoDBClient({ region });
    }

    try {
        const response = await axios.get(dummyApiUrl);
        const apiResponse = response.data;

        const params = {
            TableName: tableName,
            Item: {
                id: { S: apiResponse.id.toString() },
                title: { S: apiResponse.title },
                body: { S: apiResponse.body }
            }
        };

        await dynamoDbClient.send(new PutItemCommand(params));

        console.log('Item inserted successfully:', params.Item);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch (error) {
        console.error('Error occurred:', error);

        let errorMessage = 'Unknown error';
        if (error.response) {
            errorMessage = `API error: ${error.response.data}`;
        } else if (error.request) {
            errorMessage = 'No response from API';
        } else {
            errorMessage = `Request error: ${error.message}`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage })
        };
    }
};
