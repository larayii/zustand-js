import { useSyncExternalStore } from "react";
// import { useEffect, useState } from "react";

// 原理：产生了一个闭包，createStore函数虽然调用完了，但是state并不会销毁
const createStore = (createState) => {
    let state;
    const listeners = new Set(); //监听状态变化的集合
    /**
     * 更新数据，第一个入参可能为函数或者直接为值，我们取到最新值和旧的值比较一下，看下有没有更新；如果有更新的话，
     * 根据第二个参数replace来判断是进行合并还是直接代替。把最新的值赋值给state，并执行监听器listeners中的全部监听函数
     * @param {*} partial 就是 () => ({ aaa: value } 或者 { aaa: value })
     * @param {*} replace 合并, 代替(true)
    */
    const setState = (partial, replace) => {
        const nextState = typeof partial === 'function' ? partial(state) : partial

        if (!Object.is(nextState, state)) {
            const previousState = state;

            if (!replace) {
                state = (typeof nextState !== 'object' || nextState === null)
                    ? nextState
                    : Object.assign({}, state, nextState);
            } else {
                state = nextState;
            }
            listeners.forEach((listener) => listener(state, previousState));
        }
    }

    const getState = () => state;

    //接收监听函数，并添加到监听器listeners中，并在销毁时从监听器list中清除；等待setState更新state后调用
    const subscribe = (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
    }

    //清除监听器listeners
    const destroy = () => {
        listeners.clear()
    }

    const api = { setState, getState, subscribe, destroy }
    //函数参数createState把setState，getState，api三个方法暴露出去，然后初始化state
    state = createState(setState, getState, api)

    return api
}

//状态变了，触发重新渲染
function useStore(api, selector) {
    // const [, forceRender] = useState(0);
    // useEffect(() => {
    //     api.subscribe((state, prevState) => {
    //         const newObj = selector(state);
    //         const oldobj = selector(prevState);

    //         if (newObj !== oldobj) {
    //             forceRender(Math.random());
    //         }
    //     })
    // }, []);
    // return selector(api.getState());

    function getState() {
        return selector(api.getState());
    }
    //订阅外部 store 的 React Hook
    return useSyncExternalStore(api.subscribe, getState)
}

//创建一个绑定到React Hook的仓库
export const create = (createState) => {
    //调用createStore函数创建一个store
    const api = createStore(createState)

    //自定义Hook，用于在组件中使用绑定的仓库
    const useBoundStore = (selector) => useStore(api, selector)

    //将仓库API对象的所有属性复制到useBoundStore上，以便在组件中直接使用
    Object.assign(useBoundStore, api);

    return useBoundStore
}
