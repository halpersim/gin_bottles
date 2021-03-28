/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 *
 * @author Simon Halper
 */
public class Main {
    
    public static double EPSILON = 0.005;
    public static String appendix = "_ep_" + EPSILON + "_ohne_unnetigs";
    public static String DIRECTORY = "C:/";
    
    public static void main(String[] args) throws IOException{
        long time = System.nanoTime();
        Model m = new Model(DIRECTORY + "ginfloschn.obj");
       /* int lm5 = 0;
        int g5 = 0;
        
        for(Vertex v : m.vertices){
            if(Math.abs(v.pos.y + 5.25) < 0.0001)
                lm5++;
            
            if(v.pos.y > 10)
                g5++;
        }
        
        System.out.println("zimli genau -7: " + lm5 + " -> " + (((double)lm5)/m.vertices.size()));
        System.out.println("greater than 10: " + g5 + " -> " + (((double)g5)/m.vertices.size()));
        */
        System.out.println("Model loaded ["+(System.nanoTime() - time)/1000000000+"s]");
        time = System.nanoTime();
        
        for(Group g : m.groups){
            if(g.mtl.texture == null){
                g.primitives.forEach(p -> p.forEach(f -> {if(f.tc != null) f.tc.cnt--; f.tc = null;}));
            }
        }
        List<TextureCoordinate> tc_to_remove = new LinkedList<>();
        for(TextureCoordinate tc : m.tcs){
            if(tc.cnt == 0)
                tc_to_remove.add(tc);
        }
        tc_to_remove.forEach(tc -> m.tcs.remove(tc));
        System.out.println("TCs ready ["+(System.nanoTime() - time)/1000000000+"s] ("+tc_to_remove.size() + " texture coordinates removed)");
        time = System.nanoTime();
        
        List<Normal> normals = new LinkedList<>();
        for(Normal n : m.normals){
            Optional<Normal> same = normals.stream().filter(norm -> n.normal.equals(norm.normal)).findFirst();
            
            if(same.isPresent()){
                Normal norm = same.get();
                
                norm.cnt += n.cnt;
                norm.faces.addAll(n.faces);
                n.faces.forEach(f -> f.n = norm);
            }else{
                normals.add(n);
            } 
        }
        int removed = m.normals.size() - normals.size();
        m.normals = normals;
        System.out.println("Normals ready ["+(System.nanoTime() - time)/1000000000+"s] ("+removed+" normals removed)");
        time = System.nanoTime();
        
        
        List<Vertex> v_to_remove = new LinkedList<>();
        for(Vertex v : m.vertices){
            if(v.pos.y + 7 < 0 || v.pos.z < 0 || v.pos.y - 11.6 > 0){
                v.faces.forEach(f -> f.v = null);
                v_to_remove.add(v);
            }
        }
        v_to_remove.forEach(v -> m.vertices.remove(v));
        
        for(Group g : m.groups){
            List<List<Face>> p_to_remove = new LinkedList<>();
            for(List<Face> p : g.primitives){
                if(p.stream().anyMatch(f -> f.v == null))
                    p_to_remove.add(p);
            }
            p_to_remove.forEach(p -> g.primitives.remove(p));
        }
        System.out.println("Vertices ready ["+(System.nanoTime() - time)/1000000000+"s] ("+v_to_remove.size() + " vertices removed)");
        time = System.nanoTime();
        
  
        
        
        
        m.generate_file(DIRECTORY + "ginfloschn_mit_java_iwaorweit" + appendix +".obj", "./ginfloschn_mit_java_iwaorweit" + appendix + ".mtl");
        System.out.println("writing to file ["+(System.nanoTime() - time)/1000000000+"s]");
       }
}
