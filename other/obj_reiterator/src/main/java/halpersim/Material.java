/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.io.PrintStream;
import java.util.Queue;

/**
 *
 * @author Simon Halper
 */
public class Material {
    public String name = "not_initialized";
    public double alpha = -1;
    public Vec3 ambient = null;
    public Vec3 diffuse = null;
    public Vec3 specular = null;
    public int specular_exponent = -1;
    public String texture = null;

    
    public String getName(){
        return name;
    }
    public Material(Queue<String> data){
        String first = data.poll();
        
        if(!first.startsWith("newmtl"))
            throw new IllegalArgumentException("first string of queue has to start with newmtl! str = ["+ first +" ]");
        
        name = first.replace("newmtl", "").trim();
        
        while(!data.isEmpty() && !data.peek().startsWith("newmtl")){
            String line = data.poll();
            int first_blank = line.indexOf(" ");
            
            if(first_blank == -1)
                continue;
            
            String op = line.substring(0, first_blank);
            String arg = line.replace(op, "").trim();
            
            switch(op){
                case "Ns": specular_exponent = Integer.parseInt(arg); break;
                case "Tr": case "d": alpha = Double.parseDouble(arg); break;
                case "Ka": ambient = new Vec3(arg); break;
                case "Kd": diffuse = new Vec3(arg); break;
                case "Ks": specular = new Vec3(arg); break;
                case "map_Kd": texture = arg; break;                    
            }
        }
    }
    
    public void write_to_stream(PrintStream out){
        if(!"not_initialized".equals(name)){
            out.println("newmtl " + name);
            
            if(ambient != null)
                out.println("Ka " + ambient);
            if(diffuse != null)
                out.println("Kd " + diffuse);
            if(texture != null)
                out.println("map_Kd " + texture);
            if(specular != null)
                out.println("Ks " + specular);
            if(specular_exponent != -1)
                out.println("Ns " + specular_exponent);
            if(alpha > 0)
                out.println("Tr " + alpha);            
        }
    }
}
