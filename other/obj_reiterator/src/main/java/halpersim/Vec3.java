/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

/**
 *
 * @author Simon Halper
 */
public class Vec3 {
    public double x;
    public double y;
    public double z;
    
    static public double EPSILON = Main.EPSILON;
    
    public Vec3(){
        this(0, 0, 0);
    }
    
    public Vec3(double x, double y, double z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    public Vec3(String str){
        String[] a = str.split(" ");
        
        if(a.length != 3)
            throw new IllegalArgumentException("str [" + str + "] has to solely contain 3 double values");
        
        try{
            x = Double.parseDouble(a[0]);
            y = Double.parseDouble(a[1]);
            z = Double.parseDouble(a[2]);
        }catch(RuntimeException e){
            throw new IllegalArgumentException("str [" + str + "] can not be parsed to Vec3: [" + e + "]");
        }
    }
    
    @Override
    public boolean equals(Object rhs){
        if(this.getClass() != rhs.getClass())
            return false;
        
        Vec3 v = (Vec3)rhs;
        return compare_double(this.x, v.x, EPSILON) && compare_double(this.y, v.y, EPSILON) && compare_double(this.z, v.z, EPSILON);
    }
    
    private static boolean compare_double(double lhs, double rhs, double epsilon){
        return Math.abs(lhs - rhs) < epsilon;
    }
    
    @Override
    public String toString(){
        return x + " " + y + " " + z;
    }
}
