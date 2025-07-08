const { PrismaClient } = require('../generated/prisma'); // Adjust the import path as necessary
const prisma = new PrismaClient();
module.exports = prisma;
