import { Test, TestingModule } from '@nestjs/testing';
import { VoicingController } from './voicing.controller';
import { VoicingService } from './voicing.service';

describe('VoicingController', () => {
  let controller: VoicingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoicingController],
      providers: [VoicingService],
    }).compile();

    controller = module.get<VoicingController>(VoicingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
