package com.subastas.subastas_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling

public class SubastasApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubastasApiApplication.class, args);
	}
}
