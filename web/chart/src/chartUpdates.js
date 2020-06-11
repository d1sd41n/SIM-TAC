import { createOrder } from './createOrderLine.js';
import { deleteParenNode, deletesOrdersbyButton} from './deleteHelpers.js'
import { userOrders, pendingOrders } from './createOrderLine.js';

export const changeOrderState = function(element, text, index) {
    /* modify the order template once it needs pass order to success */
    let id;
    if (element._id) id = element._id;
    else id = element.id;
    const ordersTemplate = document.getElementById('operations_list');
    const orders = ordersTemplate.childNodes;
    for (let i = 4; i < orders.length; i++) {
        if (orders[i].cells[0].dataset.id === id) {
            const order = orders[i].getElementsByTagName('td')[index]; 
            order.innerText = order.textContent = text;
            return order;
        }
    }
}

export const createStopLossOrder = function(orderObject, orderType) {
    if (orderType === 'buy') orderType = 'sell'
    else if (orderType === 'sell') orderType = 'buy';
    const quantity = orderObject.quantity * 10;
    const obstop = createOrder(orderObject.stopOrder, quantity, orderType, true, "esaCosa");
    orderObject.stopOrderId  = obstop.id;
    orderObject.stopOrderTemp = obstop.orr;
}

export const updateOrderChart = function (el, quantity, price, orderType) {
    if (orderType == 'sell') el.quantity -= (quantity / 10);
    else if (orderType == 'buy') el.quantity += (quantity / 10);
    
    if (el.quantity === 0) {
        el.orr.remove();
        deletesOrdersTemplates(el);
        deleteSpecificPendingOrder(el.stopOrderId);
        userOrders.splice(userOrders.indexOf(el), 1);
    }
    else {
        
        el.orr.setQuantity(el.quantity);
        if (el.stopOrderTemp) {
            el.stopOrderTemp.setQuantity(el.quantity);
            changeOrderState(el.stopOrderTemp._line, el.quantity, 4);
        }
        el.orr.setPrice((el.price + price) / 2);
        el.price = el.orr.getPrice().toFixed(1);
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