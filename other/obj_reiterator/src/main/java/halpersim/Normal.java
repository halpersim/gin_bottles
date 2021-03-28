/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author Simon Halper
 */
public class Normal {
    public Vec3 normal;
    public int cnt;
    public List<Face> faces = new LinkedList<>();
    
    public Normal(String str){
        normal = new Vec3(str);
        cnt = 0;
    }
}
