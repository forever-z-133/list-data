export enum ListStatus {
  WAIT, // 无状态
  LOADING, // 加载中
  NODATA, // 初始无数据
  EMPTY, // 数据已全部获取
}

export class ListDataParams {
  data: any[] = []; // 现有数据
  size: number = 10; // 分页请求量
  page: number = 1; // 页码
  status: string = "WAIT"; // 状态，见 ListStatus
}

const defaultConfig: ListDataParams = {
  data: [],
  size: 10,
  page: 1,
  status: "WAIT",
};

/**
 * 公用的分页请求方法
 * const listManager = new ListData(); // 初始化
 * listManager.ajax = (params, callback) {}; // 修改部分方法
 * listManager.refresh(); // 从头开始请求
 * listManager.update(); // 请求下一页
 */
export class _ListData {
  private config: ListDataParams;
  public list: ListDataParams;

  constructor(options = {}) {
    const config: ListDataParams = Object.assign({}, defaultConfig, options);
    const list: ListDataParams = Object.assign({}, defaultConfig, options);

    this.beforeInit(config, list);

    // 首次初始化和更新视图
    this.config = config;
    this.list = list;
    this._setState();
  }

  // 用于：1. 统一修改 size 初始值；2. 统一添加 list.total
  beforeInit(config?: ListDataParams, list?: ListDataParams): void {}
  // 用于 react 框架中使用 setState 来更新数据
  stateChange(list?: ListDataParams): void {}
  // 用于：1. 统一修改接口入参；2. 统一添加加载图
  beforeAjax(params: any): any {
    return params;
  }
  // 用于：自定义请求
  ajax(params: any, callback: Function): void {
    setTimeout(callback, 1e3, { result: [] });
  }
  // 用于：1. 统一 res.result 结构；2. 统一取消加载图；3. 统一报错弹窗
  beforePostData(res?: any, params?: any): boolean {
    return true;
  }
  // 用于：个性化结果调整，比如 res.data 转为 res.result;
  postData(res?: any): void {}
  // 用于：在渲染前修改数组信息
  convert(data?: any[]): any[] {
    return data;
  }
  // 用于：渲染结束回调
  finish(): void {}

  // ------ 外放方法
  public refresh(params?: any): void {
    this._update(params, true);
  }
  public update(params?: any): void {
    this._update(params, false);
  }

  // ------ 私有方法
  private _setState(): void {
    this.stateChange(this.list);
  }
  private _update(params?: any, isRefresh: boolean = false): void {
    if (isRefresh) {
      const { status, data } = this.config;
      this.list.status = status;
      this.list.data = data;
      this._setState();
    }

    if (this.list.status !== "WAIT") return;
    this.list.status = "LOADING";
    this._setState();

    const { page, size } = this.list;
    params = { page, size, ...params };
    params = this.beforeAjax(params);

    // 开始请求
    this.ajax(params, this._ajaxFinish.bind(this));
  }
  private _ajaxFinish(res: any = {}): void {
    const error = this.beforePostData(res);
    if (error === false) return;

    // 用于个性化结果调整
    this.postData(res);

    const newData = res.result;
    this._render(newData);
  }
  private _render(newData: any[]): void {
    newData = this.convert(newData);
    const { page: origPage } = this.config;
    const { data: oldData, page: oldPage, size } = this.list;
    let status;
    if (newData.length < 1 && oldPage <= origPage) {
      status = "NODATA";
      this.list.status = status;
      this._setState();
    } else {
      status = newData.length < size ? "EMPTY" : "WAIT";
      this.list.data = oldData.concat(newData);
      this.list.page = oldPage + 1;
      this.list.status = status;
      this._setState();
    }
    this.finish();
  }
}
