import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import com.fasterxml.jackson.jr.ob.JSON;
import com.fasterxml.jackson.jr.ob.JSONComposer;
import com.fasterxml.jackson.jr.ob.comp.ObjectComposer;


public class MapFileConverter {

	final public static String VERSION = "1.0.0";
	
	public static void main(String[] args) {
		String imagepath;
		if(args.length > 0) {
			imagepath = args[0];
		} else {
			imagepath = "C:\\Program Files (x86)\\Planetary Annihilation\\PA\\Planetary Annihilation\\stable\\media\\ui\\main\\game\\live_game\\img\\build_bar\\units";
		}
				
		String path = System.getProperty("user.dir");
			
		String sprite_map_file = "\\unit_sprites.txt"; 
		
		String[] filePaths = getFilePaths(imagepath);
		
		packSprites(
				"unit_sprites.png",
				"unit_sprites.txt",
				480,
				9000,
				0,
				false,
				false,
				true,
				"",
				filePaths);
		
		try {
			List<String> lines = Files.readAllLines(Paths.get(path + sprite_map_file), Charset.forName("UTF-8"));
			
			String jsonString = "";
			ObjectComposer<JSONComposer<String>> obj_composer = null;
			
			try {
				obj_composer = JSON.std.with(JSON.Feature.PRETTY_PRINT_OUTPUT).composeString().startObject();
			} catch (IOException e1) {
				e1.printStackTrace();
			}
			
			for(String line: lines) {
				String[] firstSplit = line.split(" = ");
				String[] secondSplit = firstSplit[1].split(" ");
				
				obj_composer.startObjectField(firstSplit[0])
				  .put("x", secondSplit[0])
				  .put("y", secondSplit[1])
				  .put("width", secondSplit[2])
				  .put("height", secondSplit[3])
				.end();
			}
			
			try {
				jsonString = obj_composer.end().finish();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			System.out.println(jsonString);
			PrintWriter out = new PrintWriter(path + "\\units.json");
			out.println(jsonString);
			out.close();
			File txtFile = new File(path + sprite_map_file);
			txtFile.delete();
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		

	}
	
	public static String[] getFilePaths(String path) {
		try {
			File folder = new File(path);
			File[] listOfFiles = folder.listFiles();
			String[] filePaths = new String[listOfFiles.length];
			
			for(int i=0; i< filePaths.length; i++) {
				filePaths[i] = listOfFiles[i].getCanonicalPath();
			}
			
			return filePaths;
		} catch (IOException e) {
			e.printStackTrace();
		}

		return new String[0];
	}
	
	public static void packSprites(
			String image,
			String map,
			int mw,
			int mh,
			int pad,
			boolean pow2,
			boolean sqr,
			boolean r,
			String il,
			String[] path) {
		
		image = " /image:" + image;
		map = " /map:" + map;
		String s_mw = " /mw:" + mw;
		String s_mh = " /mh:" + mh;
		String s_pad = " /pad:" + pad;
		String s_pow2 = (pow2 ? " /pow2" : "");
		String s_sqr = (sqr ? " /sqr" : "");
		String s_r = (r ? " /r" : "");
		il = (il != "" ? " /il:" + il : "");
		String s_path = "";
		
		for(String file: path) {
			s_path += "\"" + file + "\" ";
		}
		
		try {
			String cmd = "sspack.exe" + image + map + s_mw + s_mh + s_pad + s_pow2 + s_sqr + s_r + il + " " + s_path;
			System.out.println(cmd);
			Process proc = Runtime.getRuntime().exec(cmd);
			proc.waitFor();
			
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
		}
	}

}
