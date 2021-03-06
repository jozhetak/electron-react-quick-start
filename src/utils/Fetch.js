import { Modal, message } from 'antd';
import Common from "../constant/common";

export const toQueryString = function (obj) {
  return obj ? Object.keys(obj).sort().map(function (key) {
    var val = obj[key];
    if (Array.isArray(val)) {
      return val.sort().map(function (val2) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
      }).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(val);
  }).join('&') : '';
}

export const exceptionShow = function (result) {
  Modal.error({
    title: result.resultMsg + "[" + result.resultCode + "]",
    content: result.resultData.time + "\r\n" +
      result.resultData.url + "\r\n"
      + result.resultData.message,
  });
}

export const fetchTimeout = function (fetch_promise, timeout) {
  let abort_fn = null;
  const abort_promise = new Promise((resolve, reject) => {
    abort_fn = () => {
      reject(false);
    };
  });
  const abortable_promise = Promise.race([
    fetch_promise,
    abort_promise
  ]);
  setTimeout(() => {
    abort_fn();
  }, timeout);
  return abortable_promise;
}

export default {
  post: function (url, param, callback) {
    const regx = /\.json$/;
    if (regx.test(url)) {
      this.get(url, param, callback)
      return
    }
    fetchTimeout(fetch(url, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'App': 'react-app'
      }, body: toQueryString(param)
    }), 120000)
      .then((response) => response.json())
      .then(function (result) {
        if (result && "502" == result.resultCode) {
          exceptionShow(result);
          callback && callback(false);
        } else if (result && "5012" == result.resultCode) {
          message.error(Common.message.accessTimeout);
          window.location.href = "/login";
          sessionStorage.setItem("tokenInfo", "");
        } else {
          callback && callback(result);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(Common.message.errorNetwork);
        callback && callback(false);
      });
  },

  get: function (url, param, callback) {
    url = url + "?" + toQueryString(param);
    fetchTimeout(fetch(url, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json',
        'App': 'react-app'
      }
    }), 120000)
      .then((response) => response.json())
      .then(function (result) {
        if (result && "502" == result.resultCode) {
          exceptionShow(result);
          callback && callback(false);
        } else if (result && "5012" == result.resultCode) {
          message.error(Common.message.accessTimeout);
          window.location.href = "/login";
          sessionStorage.setItem("tokenInfo", "");
        } else {
          callback && callback(result);
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(Common.message.errorNetwork);
        callback && callback(false);
      });
  }
}
