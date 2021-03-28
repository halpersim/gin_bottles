/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.io.File;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Objects;
import java.util.Queue;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Simon Halper
 */
public class Model {
    public List<Group> groups = new ArrayList<>();
    public List<Material> materials = new ArrayList<>();
    public List<Vertex> vertices = new ArrayList<>();
    public List<TextureCoordinate> tcs = new ArrayList<>();
    public List<Normal> normals = new ArrayList<>();
   
    public String name;
    
    
    private static Queue<String> read_file(String filename) throws FileNotFoundException, IOException{
        Queue<String> file_data = new LinkedList<>();
        
        try(BufferedReader br = new BufferedReader(new FileReader(filename))){
            String line;
            
            while((line = br.readLine()) != null)
                file_data.add(line);
        }
        return file_data;
    }
    
    public Model(String filename) throws FileNotFoundException, IOException{
        Queue<String> file_data = read_file(filename);

        while(!file_data.isEmpty()){
            String line = file_data.poll().trim();
            int first_blank = line.indexOf(" ");
            
            if(first_blank != -1){
              try {
                  String op = line.substring(0, first_blank);
                  String arg = line.replace(op, "").trim();

                  switch(op){
                      case "mtllib":
                          Queue<String> mtl_file_data = read_file(filename.substring(0, filename.lastIndexOf("/")) + arg);

                          while(!mtl_file_data.isEmpty()){
                              String l = mtl_file_data.peek();
                              if(l.startsWith("newmtl")){
                                  materials.add(new Material(mtl_file_data));
                              }else{
                                  mtl_file_data.poll();
                              }
                          }
                      break;

                      case "v": vertices.add(new Vertex(arg)); break;                        
                      case "vn": normals.add(new Normal(arg)); break;
                      case "vt": tcs.add(new TextureCoordinate(arg)); break;
                      case "o": name = arg; break;
                      case "usemtl": groups.add(new Group(file_data, arg, vertices, normals, tcs, materials.stream().filter((m) -> arg.equals(m.name)).findFirst().get())); break;
                  }
              } catch (IOException ex) {
                  System.out.println(ex);;
              }
          }
        }    
    }
    
    public void generate_file(String filename, String mtlfilename) throws FileNotFoundException{
        try(PrintStream out = new PrintStream(new File(filename))){
            out.println("mtllib ./" + mtlfilename);
            out.println();
            
            vertices.forEach(v -> out.println("v " + v.pos));
            out.println("# " + vertices.size() + " vertices");
            out.println();
            normals.forEach(n -> out.println("vn " + n.normal));
            out.println("# " + normals.size() + " normals");
            out.println();
            tcs.forEach(tc -> out.println("vt " + tc.tc));
            out.println("# " + tcs.size() + " texture coordinates");
            out.println();
            
            out.println("o " + name);
            
            groups.forEach(g ->{
                out.println("usemtl " + g.name);
                
                g.primitives.forEach(prim ->{
                    out.print("f");
                    prim.forEach(f -> {
                        out.print(" ");
                        out.print((vertices.indexOf(f.v)+1) + "/");
                        if(f.tc != null)
                            out.print(tcs.indexOf(f.tc)+1);
                        out.print("/" + (normals.indexOf(f.n)+1));
                    });
                    out.println();
                });
                out.println();
            });
        }
        
        try(PrintStream out = new PrintStream(new File(filename.substring(0, filename.lastIndexOf("/")) + mtlfilename))){
            materials.forEach(mtl -> mtl.write_to_stream(out));
            out.println();
        }
    }
    
}
