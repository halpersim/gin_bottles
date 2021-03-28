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
public class TextureCoordinate {
    public Vec2 tc;
    public int cnt;    
    
    public TextureCoordinate(String str){
        tc = new Vec2(str);
        cnt = 0;
    }
}
