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
public class Vec2 {
    public double x;
    public double y;
    
    static public double EPSILON = Vec3.EPSILON;
    
    public Vec2(){
        this(0, 0);
    }
    
    public Vec2(double x, double y){
        this.x = x;
        this.y = y;
    }
    
    public Vec2(String str){
        String[] a = str.split(" ");
        
        if(a.length < 2)
            throw new IllegalArgumentException("str [" + str + "] has to solely contain 2 double values");
        
        try{
            x = Double.parseDouble(a[0]);
            y = Double.parseDouble(a[1]);
        }catch(RuntimeException e){
            throw new IllegalArgumentException("str [" + str + "] can not be parsed to Vec2: [" + e + "]");
        }
    }
    
    @Override
    public boolean equals(Object rhs){
        if(this.getClass() != rhs.getClass())
            return false;
   
        Vec2 v = (Vec2)rhs;
        return compare_double(this.x, v.x, EPSILON) && compare_double(this.y, v.y, EPSILON);
    }
    
    @Override
    public String toString(){
        return x + " " + y;
    }
    
    private static boolean compare_double(double lhs, double rhs, double epsilon){
        return Math.abs(lhs - rhs) < epsilon;
    }
}
