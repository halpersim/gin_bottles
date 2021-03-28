/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.io.PrintStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

/**
 *
 * @author Simon Halper
 */
public class Group {
    public String name;
    public Material mtl;
    public List<Triangle> triangles = new LinkedList<>();
    public List<List<Face>> primitives = new LinkedList<>();
    
    
    public Group(Queue<String> data, String name, List<Vertex> vertices, List<Normal> normals, List<TextureCoordinate> tcs, Material mtl){
        this.name = name;
        this.mtl = mtl;
        
        while(!data.isEmpty() && data.peek().startsWith("f")){
            String arg = data.poll().replace("f", "").trim();
            
            String str_faces[] = arg.split(" ");
            List<Face> faces = new LinkedList<>();
            
            for (String str_face : str_faces) {
                String[] a = str_face.split("/");
                if(a.length != 3)
                    throw new UnsupportedOperationException();
                
                Vertex v = vertices.get(Integer.parseInt(a[0]) - 1);
                TextureCoordinate tc = a[1].isEmpty() ? null : tcs.get(Integer.parseInt(a[1])- 1);
                Normal n = normals.get(Integer.parseInt(a[2])-1);
                faces.add(new Face(v, n, tc));
            }
            
            primitives.add(faces);
            
            switch(str_faces.length){
                case 3:  triangles.add(new Triangle(faces)); break;
                case 4: 
                    List<Face> f = new LinkedList<>();
                    f.add(faces.get(0));
                    f.add(faces.get(1));
                    f.add(faces.get(2));
                    triangles.add(new Triangle(f));
                    
                    f = new LinkedList<>();
                    f.add(faces.get(0));
                    f.add(faces.get(2));
                    f.add(faces.get(3));
                    triangles.add(new Triangle(f));
                break;
                default: 
                  //  throw new UnsupportedOperationException();
                    break;
            }
        }
    }

}
