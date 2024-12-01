const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Define options for the Swagger JSDoc
const options = {
  definition: {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: 'Node.js Project API', // Your API title
      version: '1.0.0', // API version
      description: 'API documentation for the Node.js project', // API description
    },
    servers: [
      {
        url: 'http://localhost:8080', // API server URL
      },
    ],
  },
  // Path to the API specs (which will be generated from your JSDoc comments)
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../controllers/*.js')], // Add your route and controller files here
};

// Initialize Swagger JSDoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
