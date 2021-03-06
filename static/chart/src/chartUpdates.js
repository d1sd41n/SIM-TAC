import { createOrder } from './createOrderLine.js';
import { deleteParenNode, deletesOrdersbyButton} from './deleteHelpers.js'
import { userOrders, pendingOrders } from './createOrderLine.js';

export const changeOrderState = function(element, text, index, flag) {
  /* modify the order template once it needs pass order to success */
  let id;
  if (element._id) id = element._id;
  else id = element.id;
  const ordersTemplate = document.getElementById('operations_list');
  const orders = ordersTemplate.childNodes;

  for (let i = 4; i < orders.length; i++) {
    if (orders[i].cells[0].dataset.id === id) {
      if (flag) orders[i].cells[7].childNodes[0].dataset.is = false;
      const order = orders[i].getElementsByTagName('td')[index];
      return order;
    }
  }
}

export const createStopLossOrder = function(orderObject, orderType) {
  if (orderType === 'buy') orderType = 'sell'
  else if (orderType === 'sell') orderType = 'buy';
  const quantity = orderObject.quantity * 10;
  const obstop = createOrder(orderObject.stopOrder, quantity, orderType, true, "...");
  orderObject.stopOrderId  = obstop.id;
  orderObject.stopOrderTemp = obstop.orr;
}

export const updateOrderChart = function (el, quantity, price, orderType, short) {
  if (short) {
    if (orderType == 'sell') el.quantity += (quantity / 10);
    else if (orderType == 'buy') el.quantity -= (quantity / 10);
  } else {
    if (orderType == 'sell') el.quantity -= (quantity / 10);
    else if (orderType == 'buy') el.quantity += (quantity / 10);
  }

  if (el.quantity === 0) {
    el.orr.remove();
    deletesOrdersTemplates(el);
    deleteSpecificPendingOrder(el.stopOrderId);
    userOrders.splice(userOrders.indexOf(el), 1);
    cacheTest('pendingOrders', el);
    if (window.localStorage.getItem('userOrders')) window.localStorage.removeItem('userOrders');
    window.localStorage.removeItem('currencies');
    window.localStorage.removeItem('shortCurrencies');
  } else {
    el.orr.setQuantity(el.quantity);
    if (el.stopOrderTemp) {
      el.stopOrderTemp.setQuantity(el.quantity);
      const element = changeOrderState(el.stopOrderTemp._line, el.quantity, 4);
      element.innerText = element.textContent = el.quantity;

      let cache = window.localStorage.getItem('pendingOrders');
      if (cache) {
        let eso = JSON.parse(cache);
        eso.filter(element => {
          const elPrice = parseInt(element.price);
          const pr = parseInt(el.stopOrder);
          if (pr.toFixed() === elPrice.toFixed()) {
            element.quantity = el.quantity;
            window.localStorage.setItem('pendingOrders', JSON.stringify(eso));
          }
        })
      }
    }
    el.orr.setPrice((el.price + price) / 2);
    el.price = el.orr.getPrice().toFixed(1);
    const order = changeOrderState(el, el.quantity, 4);
    order.innerText = order.textContent = el.quantity;
  }
  return true;
}

function deletesOrdersTemplates(el) {
  const ordersTemplate = document.getElementById('operations_list');
  const orders = ordersTemplate.childNodes;
  for (let i = 4; i < orders.length; i++) {
    if (orders[i + 1]) {
      if (orders[i + 1].cells[0].dataset.id === el.stopOrderId) {
        deleteParenNode(orders[i + 1]);
        el.stopOrderTemp.remove();
      }
    }
    if (orders[i].cells[0].dataset.id === el.id) {
      deleteParenNode(orders[i]);
    }
  }
}

function deleteSpecificPendingOrder(id) {
  for (const x in pendingOrders) {
    if (pendingOrders[x].id === id) {
      deletesOrdersbyButton(id)
      pendingOrders.splice(pendingOrders.indexOf(pendingOrders[x]), 1);
    }
  }
}

function cacheTest(st, el) {
  let cache = window.localStorage.getItem(st);
  if (cache) {
    cache = JSON.parse(cache);
    cache.filter(element => {
      let elPrice = parseInt(element.price);
      let pr = parseInt(el.stopOrder);
      if (pr.toFixed() === elPrice.toFixed()) {
        const index = cache.indexOf(element);
        if (index > -1) cache.splice(index, 1);
        window.localStorage.setItem(st, JSON.stringify(cache));
      }
    });
  }
}
