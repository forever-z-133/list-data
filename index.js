/**
 * 分页数据请求的公共方法
 */

const defaultConfig = {
  data: [],
  size: 10,
  page: 1,
  status: 'WAIT'
};

function ListData(config = {}) {
  config = Object.assign({}, defaultConfig, config);
  for (let key in config) {
    this.setState(key, config[key]);
  }
}

ListData.prototype.ajax = function(callback) {
  setTimeout(callback, 1e3, {});
};

ListData.prototype.refresh = function(params, callback) {
  this.setState('status', 'LOADING');
  this.setState('data', []);
  this.setState(page, 1);
  this.update(params, callback, true);
};

ListData.prototype.update = function(params, callback, isRefresh) {
  if (this.list.status === 'EMPTY') return;
  if (this.list.status === 'NODATA') return;
  if (this.list.status === 'LOADING') return;
  this.setState('status', 'LOADING');

  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }

  let { page, size } = this.list;
  params = { ...params, pageNum: page, pageSize: size };

  if (this.beforeAjax) {
    const newParams = this.beforeAjax(params);
    if (newParams) {
      params = newParams;
    }
  }

  this.ajax(params, res => {
    if (this.beforePostData) {
      this.beforePostData(res, params);
    }

    if (this.postData) {
      this.postData(res, params);
    }

    this.render(res, callback);
  });
};

ListData.prototype.render = function(res, callback) {
  const data = res.result || [];
  if (callback) {
    callback(data, this.finish);
  } else this.finish(data);
};

ListData.prototype.finish = function(newData) {
  if (this.convert) {
    newData = this.convert(newData);
  }
  const { data: oldData, page: oldPage, size } = this.list;
  let status;
  const data = oldData.concat(newData);
  if (newData.length < 1 && oldPage <= 1) {
    status = 'NODATA';
    this.setState(status, status);
  } else {
    status = newData.length < size ? 'EMPTY' : 'WAIT';
    this.setState(data, data);
    this.setState(page, oldPage + 1);
    this.setState(status, status);
  }
  if (this.after) {
    this.after(data, this.list);
  }
};

ListData.prototype.setState = function(key, value) {
  this.list[key] = value;
  if (this.stateChange) {
    this.stateChange(this.list, key, value);
  }
}

export default ListData;
