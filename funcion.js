import fs from 'fs';
import Express from 'express';

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async readProducts() {
    try {
      const file = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(file);
    } catch (err) {
      console.error(`Error reading file: ${err}`);
      return [];
    }
  }

  async writeProducts(products) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
      console.log(`Products saved to ${this.path}`);
    } catch (err) {
      console.error(`Error writing file: ${err}`);
    }
  }

  async addProduct(product) {
    const products = await this.readProducts();
    const newProduct = {
      ...product,
      id: products.length + 1
    };
    products.push(newProduct);
    await this.writeProducts(products);
    return newProduct;
  }

  async getProducts(limit) {
    const products = await this.readProducts();
    if (limit) {
      return products.slice(0, limit);
    }
    return products;
  }

  async getProductById(id) {
    const products = await this.readProducts();
    return products.find(product => product.id === id);
  }

  async updateProduct(id, updatedFields) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === id);
    if (index === -1) {
      return null;
    }
    const updatedProduct = { ...products[index], ...updatedFields };
    products[index] = updatedProduct;
    await this.writeProducts(products);
    return updatedProduct;
  }

  async deleteProduct(id) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === id);
    if (index === -1) {
      return null;
    }
    const deletedProduct = products.splice(index, 1)[0];
    await this.writeProducts(products);
    return deletedProduct;
  }
}

const pm = new ProductManager('productos.json');

const app = Express();

app.get('/products', async (req, res) => {
  const { limit } = req.query;
  const products = await pm.getProducts(limit && parseInt(limit, 10));
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await pm.getProductById(parseInt(id, 10));
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

const port = 8080;
app.listen(port, () => console.log(`Servidor Express escuchando en el puerto ${port}`));
