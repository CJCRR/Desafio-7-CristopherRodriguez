import { Router } from 'express';
//import { ProductManager } from '../dao/file/manager/ProductManager.js';
import  ProductManager from "../dao/mongooseManager/products.dao.js";
import CartManager from '../dao/mongooseManager/carts.dao.js';
import  productsModel  from '../dao/models/products.model.js';


const pm = new ProductManager()
const cm = new CartManager()

const router = Router();


router.get('/home', async (req, res) => {
  try {
    //const products = await ProductModel.find().lean().exec();
    let pageNum = parseInt(req.query.page) || 1;
    let itemsPorPage = parseInt(req.query.limit) || 10;
    const products = await productsModel.paginate({}, { page: pageNum , limit: itemsPorPage , lean:true });

    products.prevLink = products.hasPrevPage ? `/home?limit=${itemsPorPage}&page=${products.prevPage}` : '';
    products.nextLink = products.hasNextPage ? `/home?limit=${itemsPorPage}&page=${products.nextPage}` : '';
    

    console.log(products);
    
    res.render('home', products);
  } catch (error) {
    console.log('Error al leer los productos:', error);
    res.status(500).json({ error: 'Error al leer los productos' });
  }
  
});


router.get("/realtimeproducts", (req, res) => {
    res.render("realtimeproducts")
})

router.get("/realtimeproducts/:pid", async (req, res) => {
  const id = req.params.pid
  const product = await pm.getProductById(id)
  res.render('product', { product })
});
router.get('/carts', async (req, res) => {
  const carrito = await cm.getCarts()
  res.render('carts', { carrito });
});

router.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
      const cart = await cm.getCartById(cartId);
      res.render('cart', { cart, products: cart.products });
  } catch (err) {
      console.error('Error al obtener el carrito por ID:', err.message);
      res.status(500).send('Error al obtener el carrito por ID');
  }
});

router.get("/chat",(req,res)=>{
  res.render("chat")
})


export default router;