/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package halpersim;

import java.util.List;

/**
 *
 * @author Simon Halper
 */
public class Triangle {
    public List<Face> faces;
    
    public Triangle(List<Face> faces){
        if(faces.size() != 3)
            throw new IllegalArgumentException("triangle needs to have 3 faces! here = " + faces.size());
        this.faces = faces;
    }
}
