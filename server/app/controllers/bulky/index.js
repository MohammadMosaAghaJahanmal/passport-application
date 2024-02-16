const Slider = require('../../model/Slider');
const Product = require('../../model/Product');
const Contact = require('../../model/Contact');
const Token = require('../../model/Token');
const Admin = require('../../model/Admin');
const { connection } = require('../../utils/sequelizeConnection');
const News = require('../../model/News');


const getBulky = async(req, res) =>
{
    try {
        const response = {status: "success", data: [
            {type: "products", data: await Product.findAll({
              where: {status: 1},
              attributes: {
                include: [
                  [
                    connection.literal(`(
                      SELECT COUNT(*)
                      FROM tokens
                      WHERE tokens.productId = Product.id AND tokens.sold = 1
                    )`),
                    'tokenCount'
                  ]
                ]
              }
            })},
            {type: "sliders", data: await Slider.findAll()},
            {type: "news", data: await News.findAll()},
        ]};
        res.json(response)
    } catch (err) {
        console.log(err, "IN BULKY CONTROLLER");
        res.json({status: "failure", message: err.message})
    }
}
const getAdminBulky = async(req, res) =>
{
    
    try {
        const response = {status: "success", data: [
            {type: "products", data: await Product.findAll({
                attributes: {
                  include: [
                    [
                      connection.literal(`(
                        SELECT COUNT(*)
                        FROM tokens
                        WHERE tokens.productId = Product.id AND tokens.sold = 1
                      )`),
                      'tokenCount'
                    ]
                  ]
                },
                include: [{
                  model: Admin,
                  attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'image'],
                  as: 'admin'
                }]
              })},
            {type: "tokens", data: await Token.findAll({
                limit: 500,
                include: [{
                  model: Admin,
                  attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'image'],
                  as: 'admin'
                },
                {
                    model: Product,
                    attributes: ['id', 'name', 'target', 'photo', 'status'],
                    as: 'product'
                }]
              })},
            {type: "sliders", data: await Slider.findAll()},
            {type: "news", data: await News.findAll()},
            {type: "contacts", data: await Contact.findAll()},
        ]};
        res.json(response)
    } catch (err) {
        console.log(err, "IN ADMIN BULKY CONTROLLER");
        res.json({status: "failure", message: err.message})
    }
}
const getByQuery = async(req, res) =>
{

  let body = req.body;
  const PAGE_SIZE = 500;
  const PAGE_NUMBER = (body?.pageNumber || 1);
  const OFFSET = (PAGE_NUMBER - 1) * PAGE_SIZE;
  delete body?.pageNumber;
  
  try {

      const findTokens = await Token.findAndCountAll({
        limit: 500,
        offset: OFFSET,
        where:{
          ...body,
        },
        include: [{
          model: Admin,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'image'],
          as: 'admin'
        },
        {
            model: Product,
            attributes: ['id', 'name', 'target', 'photo', 'status'],
            as: 'product'
        }]
      });
      console.log(findTokens)
      res.json({
        data: findTokens,
        status: "success",
      })
  } catch (err) {
      console.log(err, "IN ADMIN BULKY CONTROLLER");
      res.json({status: "failure", message: err.message})
  }
}

module.exports = {
    getBulky,
    getAdminBulky,
    getByQuery
}