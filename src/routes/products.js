import { Router } from 'express';
//import  { ProductManager }  from '../dao/file/manager/ProductManager.js';
import ProductManager from "../dao/mongooseManager/products.dao.js"

const pm = new ProductManager()

const router = Router();

// Ruta raíz GET /api/products - Listar todos los productos

router.get('/', async (req, res) => {
    try {
      let { limit, page, sort, category } = req.query
      console.log(req.originalUrl);
      console.log(req.originalUrl.includes('page'));
  
      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort: { price: Number(sort) }
      };
  
      if (!(options.sort.price === -1 || options.sort.price === 1)) {
        delete options.sort
      }
  
  
      const links = (products) => {
        let prevLink;
        let nextLink;
        if (req.originalUrl.includes('page')) {
  
          prevLink = products.hasPrevPage ? req.originalUrl.replace(`page=${products.page}`, `page=${products.prevPage}`) : null;
          nextLink = products.hasNextPage ? req.originalUrl.replace(`page=${products.page}`, `page=${products.nextPage}`) : null;
          return { prevLink, nextLink };
        }
        if (!req.originalUrl.includes('?')) {
  
          prevLink = products.hasPrevPage ? req.originalUrl.concat(`?page=${products.prevPage}`) : null;
          nextLink = products.hasNextPage ? req.originalUrl.concat(`?page=${products.nextPage}`) : null;
          return { prevLink, nextLink };
        }
  
        prevLink = products.hasPrevPage ? req.originalUrl.concat(`&page=${products.prevPage}`) : null;
        nextLink = products.hasNextPage ? req.originalUrl.concat(`&page=${products.nextPage}`) : null;
        console.log(prevLink)
        console.log(nextLink)
  
        return { prevLink, nextLink };
  
      }
  
      const categories = await pm.categories()
  
      const result = categories.some(categ => categ === category)
      if (result) {
  
        const products = await pm.getProducts({ category }, options);
        const { prevLink, nextLink } = links(products);
        const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
        return res.status(200).send({ status: 'success', payload: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink });
      }
  
      const products = await pm.getProducts({}, options);
      const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
      const { prevLink, nextLink } = links(products);
      return res.status(200).send({ status: 'success', payload: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink });
    } catch (err) {
      console.log(err);
    }
  
  })


// Ruta GET /api/products/:pid - Traer sólo el producto con el id proporcionado
router.get("/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);
  const product = await manager.getProductsById(pid);
  if (product === "No Encontrado") {
      res.status(400).json({ message: "Producto no encontrado" });
  } else if (product) {
      res.status(200).json(product);
  } else {
      res.status(400).json({ message: "Producto no encontrado" });
  }
});

// Ruta raíz POST /api/products - Agregar un nuevo producto
router.post("/", async (req, res) => {
  try {
      const product = await pm.addProduct(req.body);
      if (product === "El código insertado ya existe") {
          res.status(400).json({ message: "Error al crear el producto", product });
      } else if (product === "Complete todos los campos") {
          res.status(400).json({ message: "Error al crear el producto", product });
      } else {
          res.status(201).json({ message: "Producto creado", product });
      }
  } catch (error) {
      throw new error("Error al crear el producto", error);
  }
});

// Ruta PUT /api/products/:pid - Actualizar un producto
router.put("/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);
  const product = await pm.updateProduct(pid, req.body);
  if (product) {
      res.status(200).json({ message: "Producto actualizado", product });
  } else {
      res.status(400).json({ message: "Error al actualizar el producto" });
  }
});

// Ruta DELETE /api/products/:pid - Eliminar un producto
router.delete("/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);
  const product = await pm.deleteProduct(pid);
  if (product === `No se encuentra el producto con el id : ${id}`) {
      res.status(400).json({ message: "Error al eliminar el producto", product });
  } else if (product) {
      res.status(200).json({ message: "Producto eliminado", product });
  } else {
      res.status(400).json({ message: "Error al eliminar el producto" });
  }
});


export default router;