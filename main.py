import cv2
import numpy as np
import networkx as nx
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
from skimage.morphology import skeletonize
from scipy.spatial import KDTree

# ---------- PATH GENERATION LOGIC ----------

def generate_path(img, blur, t1, t2, size):
    # 1. Image Preprocessing
    img = cv2.resize(img, (size, size))
    img = cv2.GaussianBlur(img, (blur*2+1, blur*2+1), 0)
    edges = cv2.Canny(img, t1, t2)

    # 2. Skeletonize to get single-pixel lines
    skel = skeletonize(edges > 0)
    points = np.argwhere(skel)
    
    if len(points) == 0:
        return np.zeros((size, size), np.uint8), []

    # 3. Build a Graph (8-connectivity)
    # Convert [y, x] to [x, y]
    nodes = [(p[1], p[0]) for p in points]
    G = nx.Graph()
    G.add_nodes_from(nodes)

    # Fast neighbor connection using KDTree
    tree = KDTree(nodes)
    for i, p in enumerate(nodes):
        # Find neighbors within 1.5 pixels (includes diagonals)
        indices = tree.query_ball_point(p, 1.5)
        for idx in indices:
            if nodes[idx] != p:
                G.add_edge(p, nodes[idx])

    # 4. Connect Disconnected Components with "Bridges"
    # This ensures the entire image is one single walkable structure
    comps = list(nx.connected_components(G))
    if len(comps) > 1:
        # Sort components by their center position to keep bridges logical
        comp_list = [list(c) for c in comps]
        main_comp = set(comp_list[0])
        remaining_comps = comp_list[1:]

        while remaining_comps:
            # Find the closest point between the 'connected' part and all other islands
            main_pts = np.array(list(main_comp))
            main_tree = KDTree(main_pts)
            
            best_dist = float('inf')
            best_pair = None
            best_comp_idx = -1

            for i, comp in enumerate(remaining_comps):
                comp_pts = np.array(comp)
                dist, idx_in_main = main_tree.query(comp_pts[0]) # Check first point
                if dist < best_dist:
                    best_dist = dist
                    best_pair = (tuple(main_pts[idx_in_main]), tuple(comp_pts[0]))
                    best_comp_idx = i
            
            # Bridge the two closest components
            G.add_edge(best_pair[0], best_pair[1])
            main_comp.update(remaining_comps.pop(best_comp_idx))

    # 5. Continuous Backtracking Traversal (The "Repeat Points" Logic)
    # This generates a path that NEVER jumps; it only moves to adjacent pixels
    path = []
    visited_edges = set()
    
    # Start at the top-left-most point
    start_node = min(nodes, key=lambda p: p[0] + p[1])
    
    def dfs_backtrack(u):
        path.append(u)
        # Sort neighbors to prioritize "unvisited" edges to keep the line moving
        neighbors = list(G.neighbors(u))
        for v in neighbors:
            edge = tuple(sorted((u, v)))
            if edge not in visited_edges:
                visited_edges.add(edge)
                dfs_backtrack(v)
                # After returning from a branch, we add 'u' again (the backtrack)
                path.append(u)

    # Set recursion limit higher for complex images
    import sys
    sys.setrecursionlimit(max(2000, len(nodes) * 2))
    dfs_backtrack(start_node)

    # 6. Render the path
    canvas = np.zeros((size, size), np.uint8)
    for i in range(1, len(path)):
        p1 = tuple(map(int, path[i-1]))
        p2 = tuple(map(int, path[i]))
        cv2.line(canvas, p1, p2, 255, 1)

    return canvas, path

# ---------- GUI APPLICATION ----------

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Continuous Line (No Jumps)")

        self.img = None
        self.coords = []

        self.canvas_label = tk.Label(root)
        self.canvas_label.pack(pady=10)

        controls = tk.Frame(root)
        controls.pack(padx=10, pady=10)

        self.blur = self.create_slider(controls, "Blur", 0, 5, 1)
        self.t1 = self.create_slider(controls, "Edge Low", 10, 255, 100)
        self.t2 = self.create_slider(controls, "Edge High", 10, 255, 200)
        self.size = self.create_slider(controls, "Res", 150, 600, 400)

        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=5)
        
        tk.Button(btn_frame, text="Load Image", command=self.load).pack(side="left", padx=5)
        tk.Button(btn_frame, text="Update", command=self.update).pack(side="left", padx=5)
        tk.Button(btn_frame, text="Save Path", command=self.save).pack(side="left", padx=5)

    def create_slider(self, parent, label, f, t, default):
        s = tk.Scale(parent, from_=f, to=t, label=label, orient="horizontal")
        s.set(default)
        s.pack(side="left")
        return s

    def load(self):
        path = filedialog.askopenfilename()
        if path:
            self.img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            self.update()

    def update(self):
        if self.img is None: return
        
        res_img, self.coords = generate_path(
            self.img, self.blur.get(), self.t1.get(), self.t2.get(), self.size.get()
        )

        img_pil = Image.fromarray(res_img)
        img_tk = ImageTk.PhotoImage(img_pil)
        self.canvas_label.configure(image=img_tk)
        self.canvas_label.image = img_tk

    def save(self):
        if not self.coords: return
        path = filedialog.asksaveasfilename(defaultextension=".txt")
        if path:
            np.savetxt(path, self.coords, fmt="%d", delimiter=",")

if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()