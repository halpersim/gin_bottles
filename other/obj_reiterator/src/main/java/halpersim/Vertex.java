/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Simon Halper
 */
public class Vertex {
    public Vec3 pos;
    public int cnt;
    public List<Face> faces = new ArrayList<>();
    
    public Vertex(String str){
        pos = new Vec3(str);
        cnt = 0;
    }
}
