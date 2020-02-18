# 分页数据请求

可以用于 jquery vue react 等各类项目中，可简化较多重复代码，使分页数据请求更便于管理和使用。

## 如何安装

```js
npm i list-data
```

## 基础使用

以 vue 开发实践举例，只需将各属性方法绑定即可。

```js
new Vue({
  template: `
    <div class="some-list">
      <div class="list-box">
        <block v-for="(item, index) in someList.data" :key="index">
          <div class="item>{{ index }}</div>
        </block>
      </div>
      <div class="list-status">
        <span v-if="someList.status === 'LOADING'">加载中</span>
        <span v-if="someList.status === 'NODATA'">没有数据</span>
        <span v-if="someList.status === 'EMPTY'">没有更多数据了</span>
      </div>
    </div>
  `,
  data() {
    const ListManager = new ListData();
    const { list: someList } = ListManager;
    return {
      ListManager,
      someList
    };
  },
  created() {
    this.initSomeList();
  },
  methods: {
    initSomeList() {
      const { ListManager } = this;
      ListManager.ajax = this.someAjax.bind(this);
      ListManager.refresh();
    },
    someAjax(params, calllback) {
      this.$axios.get('https://some-url', params, callback);
    },
    onReachBottom() {
      // 触底加载 或 换页加载
      // 且当数据加载中或无数据或全加载完时自动不会继续请求
      this.ListManager.update();
    },
    onPullDownRefresh() {
      // 下拉刷新 或 更换tab时·
      this.ListManager.refresh();
    }
  }
});
```

react 与 vue 不同在于数据更新需使用 setState，所以只需在 initSomeList 再继续加上绑定即可。

```js
ListManager.stateChange = state => this.setState({ someList: state });
```

## 扩展使用

```js
// ListData 构造器
class ListData {
  list: {
    data: [],
    size: 10,
    page: 1,
    status: 'WAIT' // WAIT LOADING NODATA EMPTY
  },
  beforeAjax(params) {},
  ajax(params, callback) {},
  beforePostData(res, params) {},
  postData(res, params) {},
  convert(newData) {},
  after(data, list) {},
  refresh(params) {},
  update(params) {},
  stateChange(list, key, value) {}
}
```

比如，可进行类似以下操作的拓展：

- 可在 beforeAjax 或 ajax 阶段改变入参或加上 loading 弹层
- 可在 beforePostData 阶段加入取消 loading 弹层和报错弹层等
- 可在 postData 阶段取用数据的不同层级作为根数据，并部分处理请求数据
- 可在 convert 阶段对列表数据进行一定的遍历操作

```js
ListManager.beforeAjax = params => {
  Toast.loading('加载中');
  const { page, size } = params;
  return { pageNo: page, pageSize: size, type: '1' };
};
ListManager.beforePostData = res => {
  if (res.status !==) {
    Toast.error(res.errMsg || '请求错误');
    return false;
  }
  Toast.hide();
};
ListManager.postData = res => {
  const data = res.result.list || [];
  this.total = res.result.total; // 获取数据后用在别处
  res.result = data;  // 注意：data 需从 res.result 处取得
}
ListManager.convert = data => {
  data.forEach(item => (item.flag = true));
}
```

当然你也可以做二次封装，利用 ListData.prototype 始终复用 beforePostData 而不用每个实例都书写一次。
