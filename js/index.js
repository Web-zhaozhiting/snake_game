// 多个自调用函数要用分号;隔开
// ------------- Tools ------------
(function () {
    // 因为只有一个对象，所以用不到构造函数写法
    var Tools = {
        getRandom: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
    window.Tools = Tools;
})();

// ------------- Food --------------
// 需求：1-食物有位置(x,y)，大小宽高，颜色属性；并且有把食物渲染到页面上的方法
// 5-自调用函数，开启新的作用域，避免命名冲突
(function () {
    // 5-1 局部作用域 

    // 4-1 记录上一次创建的食物，为删除元素做准备
    var elem = [];
    // 创建对象，设置对象的基本样式
    function Food(options) {
        options = options || {};
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 20;
        this.height = options.height || 20;
        this.color = options.color || 'red';
        this.parent = parent;
    }
    // 渲染方法
    // 把地图当做参数传入
    Food.prototype.render = function (parent) {
        // 与清除定时器类似(先清除上一个)
        removeElem();
        // 3-随机生成方块的位置(随机设置x,y的值)
        // 最大值：parent的最大宽度 / 这个div盒子的宽度 = 总共能放多少个div 
        //  （最小值， 最大值）
        this.x = Tools.getRandom(0, parent.offsetWidth / this.width - 1) * this.width;
        this.y = Tools.getRandom(0, parent.offsetHeight / this.height - 1) * this.height;

        // 2-动态创建div,页面上显示的食物
        var div = document.createElement('div');
        parent.appendChild(div);
        // 4-2 把创建的食物记录到数组
        elem.push(div);
        // 设置div的样式
        div.style.left = this.x + 'px';
        div.style.top = this.y + 'px';
        div.style.width = this.width + 'px';
        div.style.height = this.height + 'px';
        div.style.backgroundColor = this.color;
        div.style.position = 'absolute';
    }
    // 4-删除元素(移除页面中已经存在的div)
    function removeElem() {
        // 倒着遍历数组，这样才能完全的删除数组所有的元素
        for (let i = elem.length - 1; i >= 0; i--) {
            // 删除div
            elem[i].parentNode.removeChild(elem[i]);
            // 删除数组元素
            // 第一个参数要删除项的位置(从哪个位置开始删除)
            elem.splice(i, 1);
        }
        // for (let i = 0; i < elem.length; i++) {
        //     // 删除div
        //     elem[i].parentNode.removeChild(elem[i]);
        //     // 删除数组元素
        //     // 第一个参数要删除项的位置(从哪个位置开始删除)
        //     elem.splice(i,1);
        // }
    }
    // 5-2把Food 构造函数设置为window，变成全局可以让外部访问
    window.Food = Food;
})();

// ------------- Snake --------------
// 自调用函数，开启一个新的局部作用域，防止命名冲突
(function () {
    var elem = [];
    function Snake(options) {
        options = options || {};
        // 设置蛇节的大小
        this.width = options.width || 20;
        this.height = options.height || 20;
        // 设置蛇移动的方向
        this.direction = options.direction || 'right';
        // 设置蛇的身体(蛇节)，第一个元素为蛇头
        this.body = [{
                x: 3,
                y: 2,
                color: 'red'
            },
            {
                x: 2,
                y: 2,
                color: 'blue'
            },
            {
                x: 1,
                y: 2,
                color: 'blue'
            }
        ];
    }
    Snake.prototype.render = function (parent) {
        // 删除之前创建的蛇(与食物一样)
        remove();
        // 把每一个蛇节都渲染到地图上
        for (let i = 0, len = this.body; i < len.length; i++) {
            var object = this.body[i];
            // 创建div
            var div = document.createElement('div');
            parent.appendChild(div);

            // 记录当前蛇
            elem.push(div);
            // 设置样式
            div.style.position = 'absolute';
            div.style.width = this.width + 'px';
            div.style.height = this.height + 'px';
            div.style.left = object.x * this.width + 'px';
            div.style.top = object.y * this.height + 'px';
            div.style.backgroundColor = object.color;
        }
    }
    // 控制蛇移动的方法 (更改body中的坐标信息、根据蛇头与食物的坐标信息，判断蛇是否吃掉食物)
    Snake.prototype.move = function (map, food) {
        // 控制蛇的身体移动 (当前的蛇节 到 前一个蛇节的位置)
        // 倒序遍历（因为只移动蛇身，所以>0不取蛇头）
        for (let i = this.body.length - 1; i > 0; i--) {
            this.body[i].x = this.body[i - 1].x;
            this.body[i].y = this.body[i - 1].y;
        }
        // 控制蛇头的移动
        // 判断蛇移动的方向
        var head = this.body[0];
        switch (this.direction) {
            case 'right':
                head.x += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'top':
                head.y -= 1;
                break;
            case 'bottom':
                head.y += 1;
                break;
        }
        // game.js 2-4判断蛇和食物是否坐标重合(重合表明蛇吃到食物)
        // 因为蛇是在移动中和食物的坐标重合的，所以要写到移动的方法里面
        var headX = head.x * this.width;
        var headY = head.y * this.height;
        if (headX === food.x && headY === food.y) {
            // 要让蛇增加一节
            // 获取蛇的最后一节
            var last = this.body[this.body.length - 1];
            this.body.push({
                x: last.x,
                y: last.y,
                color: last.color
            })
            // 随机在地图上重新生成食物
            food.render(map)
        }

    }
    // 删除元素(私有的成员)
    function remove() {
        // 倒序遍历
        for (var i = elem.length - 1; i >= 0; i--) {
            // 先删除div
            elem[i].parentNode.removeChild(elem[i]);
            // 删除数组中的元素
            elem.splice(i, 1);
        }
    }
    // 让构造函数能够在外部访问
    window.Snake = Snake;
})();
// ------------- Game --------------
// 自调用函数，局部作用域
(function () {
    // 储存Game 构造函数的this
    var that;//记录游戏对象
    // 主要用来操作 蛇 和 食物(主管游戏的逻辑)
    function Game(map) {
        this.food = new Food();
        this.snake = new Snake();
        this.map = map;
        that = this;
    }
    Game.prototype.start = function () {
        // 1把蛇和食物渲染出来
        this.food.render(this.map);
        this.snake.render(this.map);
        // 测试
        // this.snake.render(this.map);
        // this.snake.move();
        // this.snake.render(this.map);
        // this.snake.move();
        // this.snake.move();
        runSnake();
        // 2-3 通过键盘控制蛇移动的方向
        bindKey();

    }
    // 私有的函数外部访问不到，通过prototype创建的函数，外部可以访问
    // 2-1 让蛇移动起来(私有的函数)
    function runSnake() {
        var timerId = setInterval(function () {
            this.snake.move(this.map, this.food); // 更新蛇中 body的数据
            // 2-2 当蛇碰到边界游戏结束 
            // 获取map最大能够 承下多少 snake盒子
            var maxX = this.map.offsetWidth / this.snake.width;
            var maxY = this.map.offsetHeight / this.snake.height;
            // 获取蛇头的坐标
            var headX = this.snake.body[0].x;
            var headY = this.snake.body[0].y;
            // 判断蛇body中的数据是否符合要求
            if (headX < 0 || headX >= maxX) {
                alert('游戏结束');
                clearInterval(timerId);
                return;
            }
            if (headY < 0 || headY >= maxY) {
                alert('游戏结束');
                clearInterval(timerId);
                return;
            }
            that.snake.render(that.map); // 根据body的数据，重新渲染蛇在页面的位置
        }.bind(that), 150)
    }
    // 2-3给键盘绑定事件
    function bindKey() {
        document.addEventListener('keydown', function (e) {
            // 键盘码 
            // 37--left,38--top,39--right,40--bottom
            switch (e.keyCode) {
                case 37:
                    that.snake.direction = 'left';
                    break;
                case 38:
                    that.snake.direction = 'top';
                    break;
                case 39:
                    that.snake.direction = 'right';
                    break;
                case 40:
                    that.snake.direction = 'bottom';
                    break;
            }

        }, false);
    }

    // 把构造函数暴露给外部
    window.Game = Game;
})();

// ------------- main --------------
(function () {
    var map = document.getElementById('map');
    var game = new Game(map);
    game.start();
})()