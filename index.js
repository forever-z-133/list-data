const defaultConfig = {
  data: [],
  size: 10,
  page: 1,
  status: 'WAIT'
};

export default class ListData {
  constructor(config = {}) {
    config = Object.assign({}, defaultConfig, config);
    const list = {};

    // 用于：1. 统一修改 size 初始值；2. 统一添加 list.total
    if (this.beforeInit) {
      this.beforeInit(config, list);
    }

    // 首次初始化和更新视图
    this.config = config;
    this.list = list;
    Object.keys(config).forEach(key => {
      this.setState(key, config[key]);
    });
  }
  setState(key, value) {
    this.list[key] = value;

    // 用于 react 框架中使用 setState 来更新数据
    if (this.stateChange) {
      this.stateChange(this.list, key, value);
    }
  }
  ajax(params, callback) {
    setTimeout(callback, 1e3, { result: [] });
  }
  refresh(params) {
    this.update(params, true);
  }
  update(params, isRefresh) {
    if (isRefresh) {
      const { status, data, page } = this.config;
      this.setState('status', status);
      this.setState('data', data);
      this.setState('page', page);
    }

    if (this.list.status !== 'WAIT') return;
    this.setState('status', 'LOADING');

    const { page, size } = this.list;
    params = { page, size, ...params };

    // 用于：1. 统一 size 改 pageSize；2. 统一添加加载图
    if (this.beforeAjax) {
      const newParams = this.beforeAjax(params);
      if (newParams) params = newParams;
    }

    // 开始请求
    this.ajax(params, this.ajaxFinish.bind(this));
  }
  ajaxFinish(res = {}) {
    // 用于：1. 统一 res.result 结构；2. 统一取消加载图；3. 统一报错弹窗
    if (this.beforePostData) {
      const error = this.beforePostData(res);
      if (error === true) return;
    }

    // 用于个性化结果调整
    if (this.postData) {
      this.postData(res);
    }

    const newData = res.result;
    this.render(newData);
  };
  render(newData) {
    if (this.convert) {
      newData = this.convert(newData);
    }
    const { page: origPage } = this.config;
    const { data: oldData, page: oldPage, size } = this.list;
    let status;
    const data = oldData.concat(newData);
    if (newData.length < 1 && oldPage <= origPage) {
      status = 'NODATA';
      this.setState('status', status);
    } else {
      status = newData.length < size ? 'EMPTY' : 'WAIT';
      this.setState('data', data);
      this.setState('page', oldPage + 1);
      this.setState('status', status);
    }
    if (this.finish) {
      this.finish(data, this.list);
    }
  };
}
