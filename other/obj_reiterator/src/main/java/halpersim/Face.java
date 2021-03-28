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
public class Face {
    public Vertex v;
    public Normal n;
    public TextureCoordinate tc;
    
    public Face(Vertex v, Normal n, TextureCoordinate tc){
        this.v = v;
        this.n = n;
        this.tc = tc;
        
        v.cnt++;
        n.cnt++;
        tc.cnt++;
        
        n.faces.add(this);
        v.faces.add(this);
    }
    
}
