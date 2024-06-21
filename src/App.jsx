import { create } from "./myZustand";
import { immer } from "./middleware/immer";

const useTestStore = create(
  immer(
    (set) => ({
      count: 0,
      // increment: (qty) =>
      //   set((state) => ({
      //     // ...state,
      //     //zustand会自动合并第一层的state,如果是更深层的状态需要...state修改state
      //     count: state.count + qty,
      //   })),
      // decrement: (qty) =>
      //   set((state) => ({
      //     ...state,
      //     count: state.count - qty,
      //   })),

      increment: (qty) =>
        set((state) => {
          state.count += qty;
        }),
      decrement: (qty) =>
        set((state) => {
          state.count -= qty;
        }),
    }),
    { name: "mypersist" }
  )
);

export default function App() {
  useTestStore.subscribe((state) => {
    console.log("store更新了");
    console.log(useTestStore.getState());
  });

  const count = useTestStore((state) => state.count);
  const increment = useTestStore((state) => state.increment);
  const decrement = useTestStore((state) => state.decrement);

  return (
    <div style={{ textAlign: "center",marginRight:"260px",marginTop:"40px" }}>
      <h1>手写一个状态管理仓库zustand</h1>
      {count}
      <br />
      <button
        style={{ marginRight: "20px", marginTop: "20px" }}
        onClick={() => {
          increment(1);
        }}
      >
        +1
      </button>
      <button
        onClick={() => {
          decrement(1);
        }}
      >
        -1
      </button>
    </div>
  );
}
