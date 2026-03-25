const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cust', require('./routes/cust'));
app.use('/api/fact', require('./routes/fact'));
app.use('/api/item', require('./routes/item'));
app.use('/api/user', require('./routes/user'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
